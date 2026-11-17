// ProductCard.tsx client/src/components/product/ProductCard.tsx
// The standard product card (Home "Featured products", and the Shop page in STEP 34):
// photo with a badge, category, name, stars, price, and an "Add" button.
//   <ProductCard product={product} />

// Other Home rows change the badge and the line under the name (STEP 33):
//   <ProductCard product={product} badge={{ label: "NEW", className: "bg-primary text-white" }} details={<p>...</p>} />

// STEP 32 (part 7): The product card

import { useState } from "react";
import type { ReactNode } from "react";
import { MdOutlineImageNotSupported } from "react-icons/md";
import { Link } from "react-router-dom";
import type { ProductSummary } from "../../types/api";
import Price from "../common/Price";
import RatingStars from "../common/RatingStars";

// The badge colours from the design: SALE red, TOP SELLER green, anything else amber ("#4 BEST SELLER")
const badgeColor = (badge: string) =>
  badge === "SALE"
    ? "bg-danger text-white"
    : badge === "TOP SELLER"
      ? "bg-success text-white"
      : "bg-warning text-white";

type ProductCardProps = {
  product: ProductSummary;
  badge?: { label: string; className: string }; // replaces the product's own badge, e.g. "#1 BEST SELLER" (STEP 33)
  details?: ReactNode; // replaces the stars line under the name (STEP 33)
};

const ProductCard = ({ product, badge, details }: ProductCardProps) => {
  const [imageError, setImageError] = useState(false);

  const soldOut = product.trackStock && product.stock === 0;
  const link = `/product/${product.slug}`;
  // The badge to show: the one given by the row, or the product's own (SALE, TOP SELLER...), or none
  const shownBadge =
    badge ??
    (product.badge
      ? { label: product.badge, className: badgeColor(product.badge) }
      : null);
  const imageUrl = product.images?.[0];

  return (
    <article className="group flex w-full flex-col rounded-3xl bg-surface p-3 shadow-card transition-shadow hover:shadow-lift">
      <Link
        to={link}
        className="relative mb-4 block overflow-hidden rounded-2xl bg-field"
      >
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy" // the browser only downloads it when it's about to scroll into view
            onError={() => setImageError(true)}
            className="aspect-4/3 w-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="flex aspect-4/3 flex-col items-center justify-center gap-2 text-muted">
            <MdOutlineImageNotSupported size={32} aria-hidden="true" />
            <span className="text-xs">Photo unavailable</span>
          </span>
        )}

        {shownBadge && (
          <span
            className={`absolute top-3 left-3 rounded-full px-2.5 py-1 text-[11px] leading-3.5 font-bold uppercase ${shownBadge.className}`}
          >
            {shownBadge.label}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col px-1 pb-1">
        <p className="text-[11px] leading-4 font-semibold tracking-wider text-muted uppercase">
          {product.category.name}
        </p>

        <h3 className="mt-1 text-base leading-5.5 font-semibold text-ink">
          {/* The link covers the name only, so the Add button isn't inside a link */}
          <Link to={link} className="hover:text-primary">
            {product.name}
          </Link>
        </h3>

        <div className="mt-1.5">
          {details ?? (
            <RatingStars
              rating={product.ratings}
              count={product.reviewCount}
              size={15}
            />
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <Price price={product.price} oldPrice={product.oldPrice} />
          {soldOut ? (
            <button
              type="button"
              disabled
              aria-label={`${product.name} is sold out`}
              className="h-9 shrink-0 cursor-not-allowed rounded-full bg-line-soft px-4 text-sm font-semibold text-muted"
            >
              Sold out
            </button>
          ) : (
            <Link
              to={link}
              aria-label={`View ${product.name} options before adding to cart`}
              className="inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-navy px-4 text-sm font-semibold text-white transition-colors hover:bg-primary"
            >
              Add
            </Link>
          )}
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
