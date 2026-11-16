// orderController.ts server/src/controllers/orderController.ts
// Checkout and the customer's own orders.

// STEP 22 (part 4): Orders
// (every route has protect, so req.user is always the logged-in user)
// POST  /api/orders                      -> place an order (the "PLACE ORDER NOW" button)
// GET   /api/orders                      -> my orders (?status=in-progress|shipped|delivered|cancelled, ?search=, ?sort=oldest)
// GET   /api/orders/summary              -> the numbers and recent orders on My Account
// GET   /api/orders/:orderNumber         -> one order (e.g. /api/orders/QC-1042)
// PATCH /api/orders/:orderNumber/cancel  -> cancel it (only within 1 hour, while still processing)

import { Request, Response } from "express";
import { HydratedDocument, isValidObjectId, Types } from "mongoose";
import { env } from "../config/env";
import { nextNumber } from "../models/counter";
import { IOrder, IOrderItem, Order, OrderStatus } from "../models/order";
import { liveProducts, Product } from "../models/Products";
import { PromoCode } from "../models/promoCodes";
import { AppError } from "../utils/apperror";
import { escapeRegex } from "../utils/escapeRegex";
import {
  cancelDeadline,
  canCancel,
  chargeCard,
  DELIVERY_OPTIONS,
  DeliveryMethod,
  estimateDelivery,
  formatDate,
  isLagos,
} from "../utils/orderRules";
import { applyPromo, naira } from "../utils/promo";
import { sendEmail } from "../utils/sendEmail";
import { pickAddress } from "./accountControllers";

const me = (req: Request) => req.user!;

export const placeOrder = async (_req: Request, res: Response) => {
  res.status(501).json({ message: "Order placement is not implemented yet." });
};

export const getMyOrders = async (_req: Request, res: Response) => {
  res.json({ orders: [] });
};

export const getOrder = async (
  _req: Request<{ orderNumber: string }>,
  res: Response,
) => {
  res.json({ order: null });
};

export const getOrderSummary = async (_req: Request, res: Response) => {
  res.json({
    summary: {
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    },
    recentOrders: [],
  });
};

export const cancelOrder = async (
  _req: Request<{ orderNumber: string }>,
  res: Response,
) => {
  res.json({ message: "Order cancellation is not implemented yet." });
};

const MAX_QUANTITY = 10; // per cart line
const FIRST_ORDER_NUMBER = 1042; // the first order is #QC-1042, like the designs

// ===== Helpers =====

// The body's "items" -> [{ productId, quantity, color }], or a 400 the checkout can show
const readCart = (items: unknown) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError(400, "Your cart is empty.");
  }

  return items.map((item) => {
    const { productId, quantity, color } = (item ?? {}) as Record<
      string,
      unknown
    >;
    const qty = Number(quantity);

    if (!isValidObjectId(productId)) {
      throw new AppError(
        400,
        "An item in your cart is no longer available. Please refresh your cart.",
      );
    }

    // Number.isInteger: 2 yes; 1.5, "two", NaN no
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QUANTITY) {
      throw new AppError(
        400,
        `Quantity must be a whole number from 1 to ${MAX_QUANTITY}.`,
      );
    }

    return {
      productId: String(productId),
      quantity: qty,
      color: color ? String(color) : undefined,
    };
  });
};

// Take the stock: one update per product. "stock: { $gte: qty }" = only if there's still enough.
// Two people buying the last one at the same moment: MongoDB lets only one update match, the other gets the 409.
const reserveStock = async (
  wanted: Map<string, number>,
  products: Map<string, { name: string; trackStock: boolean }>,
) => {
  const reserved: { product: string; quantity: number }[] = [];

  for (const [id, quantity] of wanted) {
    const product = products.get(id)!;

    const result = product.trackStock
      ? await Product.updateOne(
          { _id: id, stock: { $gte: quantity } },
          { $inc: { stock: -quantity, sold: quantity } },
        )
      : await Product.updateOne({ _id: id }, { $inc: { sold: quantity } }); // made to order: stock isn't counted

    if (result.modifiedCount === 0) {
      await releaseStock(reserved); // give back what we already took for this order
      throw new AppError(
        409,
        `Sorry, "${product.name}" just sold out. Please update your cart.`,
      );
    }

    reserved.push({ product: id, quantity });
  }
};

// Put stock back (a cancelled order, or a checkout that failed half-way)
const releaseStock = async (
  lines: { product: Types.ObjectId | string; quantity: number }[],
) => {
  if (lines.length === 0) return; // bulkWrite refuses an empty list

  await Product.bulkWrite(
    lines.flatMap(({ product, quantity }) => [
      {
        updateOne: {
          filter: { _id: product },
          update: { $inc: { sold: -quantity } },
        },
      },
      // only products that count their stock get it back
      {
        updateOne: {
          filter: { _id: product, trackStock: true },
          update: { $inc: { stock: quantity } },
        },
      },
    ]),
  );
};

// The confirmation email (plain text: sendEmail turns it into simple HTML)
const confirmationEmail = (order: IOrder) => {
  const delivery = DELIVERY_OPTIONS[order.deliveryMethod];
  const address = order.shippingAddress;

  const lines = [
    `Hi ${order.contact.firstName},`,
    "",
    `Thank you for your order! We have received order #${order.orderNumber} and started preparing it for delivery.`,
    "",
    ...order.items.map(
      (item) =>
        `- ${item.name}${item.color ? ` (${item.color})` : ""} x ${item.quantity}: ${naira(item.lineTotal)}`,
    ),
    "",
    `Subtotal: ${naira(order.subtotal)}`,
    `Delivery (${delivery.label}): ${order.deliveryFee === 0 ? "FREE" : naira(order.deliveryFee)}`,
  ];

  if (order.discount > 0) {
    lines.push(`Discount (${order.promoCode}): -${naira(order.discount)}`);
  }

  lines.push(
    `Total: ${naira(order.total)}`,
    "",
    order.payment.method === "card"
      ? `Payment: paid with ${order.payment.cardBrand} ending in ${order.payment.cardLast4}`
      : "Payment: pay on delivery (cash or POS)",
    `Delivering to: ${address.fullName}, ${address.street}, ${address.city}, ${address.state}`,
    `Estimated delivery: ${formatDate(order.estimatedDelivery.from)} - ${formatDate(order.estimatedDelivery.to)}`,
    "",
    `Track your order: ${env.clientUrl}/account/orders/${order.orderNumber}`,
    "",
    "Changed your mind? You can cancel free of charge within 1 hour of placing your order.",
    "",
    "The QuickCart team",
  );

  return lines.join("\n");
};

// An order + what the "Cancel Order" button needs ("46 mins remaining")
const withCancelInfo = (order: HydratedDocument<IOrder>) => ({
  order,
  canCancel: canCancel(order),
  cancelDeadline: cancelDeadline(order),
});

// How many of MY orders are in each status: { processing: 1, delivered: 3, ... }
const countByStatus = async (userId: Types.ObjectId) => {
  const groups = await Order.aggregate<{ _id: OrderStatus; count: number }>([
    { $match: { user: userId } },
    { $group: { _id: "$status", count: { $sum: 1 } } }, // one group per status, counting the orders
  ]);

  const counts = { processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
  for (const group of groups) counts[group._id] = group.count;
  return counts;
};

// Find one of MY orders from the URL: "QC-1042", "qc-1042" or "1042" all work. Someone else's order = 404.
const findMyOrder = async (req: Request<{ orderNumber: string }>) => {
  let orderNumber = req.params.orderNumber.trim().toUpperCase();
  if (/^\d+$/.test(orderNumber)) orderNumber = `QC-${orderNumber}`; // "1042" -> "QC-1042"

  const order = await Order.findOne({ orderNumber, user: me(req)._id });
  if (!order) {
    throw new AppError(404, "Order not found");
  }

  return order;
};
