import type { Product } from "@spree/sdk";
import { ProductCarousel } from "@/components/products/ProductCarousel";

interface RelatedProductsProps {
  products: Product[];
  basePath: string;
}

export function RelatedProducts({ products, basePath }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">You may also like</h2>
      </div>
      <ProductCarousel
        products={products}
        basePath={basePath}
        listId="related_products"
        listName="Related Products"
      />
    </section>
  );
}
