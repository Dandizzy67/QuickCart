import { MdArrowForward } from "react-icons/md";
import { Link } from "react-router-dom";
import type { DashboardResponse } from "../../types/admin";
import { naira } from "../../Utils/format";

const RecentOrdersTable = ({
  orders,
}: {
  orders: DashboardResponse["recentOrders"];
}) => (
  <section
    aria-labelledby="recent-orders-title"
    className="min-w-0 rounded-3xl bg-surface p-6 shadow-card"
  >
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2
        id="recent-orders-title"
        className="text-xl font-semibold text-ink"
      >
        Recent Orders
      </h2>
      <Link
        to="/admin/orders"
        className="flex shrink-0 items-center gap-1 text-sm font-semibold text-primary-hover hover:underline"
      >
        View all <MdArrowForward size={18} aria-hidden="true" />
      </Link>
    </div>
    {orders.length === 0 ? (
      <p className="rounded-2xl bg-panel p-4 text-sm text-ink-soft">
        No orders have been placed yet.
      </p>
      
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full min-w-155 text-left text-sm">
          <thead className="border-b border-line text-xs tracking-wide text-ink-soft uppercase">
            <tr>
              <th scope="col" className="px-3 py-3 font-semibold">
                Order
              </th>
              <th scope="col" className="px-3 py-3 font-semibold">
                Customer
              </th>
              <th scope="col" className="px-3 py-3 font-semibold">
                Date
              </th>
              <th scope="col" className="px-3 py-3 font-semibold">
                Total
              </th>
              <th scope="col" className="px-3 py-3 font-semibold">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {orders.map((order) => (
              <tr key={order._id}>
                <td className="whitespace-nowrap px-3 py-3 font-semibold text-primary-hover">
                  {order.orderNumber}
                </td>
                <td className="px-3 py-3 text-ink">
                  {order.contact.firstName} {order.contact.lastName}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-ink-soft">
                  <time dateTime={order.createdAt}>
                    {new Date(order.createdAt).toLocaleDateString("en-NG")}
                  </time>
                </td>
                <td className="whitespace-nowrap px-3 py-3 font-medium text-ink">
                  {naira(order.total)}
                </td>
                <td className="px-3 py-3">
                  <span className="rounded-full bg-primary-light px-2.5 py-1 text-xs font-semibold capitalize text-primary-hover">
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>
);

export default RecentOrdersTable;
