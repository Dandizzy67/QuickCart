import { Link } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import type { ProductSummary } from "../../types/api";
import ProductCard from "../product/ProductCard";
import SectionHeader from "../common/SectionHeader";

type ProductsResponse = { products: ProductSummary[] };

const FeaturedProduct = () => {
  const { data, error, loading, reload } =
    useApi<ProductsResponse>("/products");
  const products =
    data?.products.filter((product) => product.tags?.includes("featured")) ?? [];

  return (
    <section
      aria-labelledby="featured-products-title"
      className="mx-auto w-full max-w-5xl"
    >
      <SectionHeader
        eyebrow="Handpicked for you"
        title="Featured products"
        titleId="featured-products-title"
      >
        <Link
          to="/shop"
          className="text-sm font-semibold text-primary hover:underline"
        >
          Shop all
        </Link>
      </SectionHeader>

      {error ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-danger-light p-4 text-sm text-danger"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={reload}
            className="font-semibold underline"
          >
            Try again
          </button>
        </div>
      ) : loading ? (
        <ul
          aria-label="Loading featured products"
          className="grid grid-cols-2 gap-4 md:grid-cols-4"
        >
          {Array.from({ length: 4 }, (_, index) => (
            <li
              key={index}
              aria-hidden="true"
              className="aspect-3/4 animate-pulse rounded-3xl bg-surface shadow-card"
            />
          ))}
        </ul>
      ) : products.length > 0 ? (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.slice(0, 4).map((product) => (
            <li key={product._id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      ) : (
        <p role="status" className="rounded-2xl bg-surface p-5 text-sm text-muted">
          No featured products are available right now.
        </p>
      )}
    </section>
  );
};

export default FeaturedProduct;
