import { Heart } from "lucide-react";
import { connection } from "next/server";
import { WishlistList } from "@/components/account/WishlistList";
import { listWishlistItems } from "@/lib/data/wishlist";

interface WishlistPageProps {
  params: Promise<{ country: string; locale: string }>;
}

export default async function WishlistPage({ params }: WishlistPageProps) {
  // Required for Next.js 15+ dynamic route params
  await connection();
  const { country, locale } = await params;

  // Construct the base path to pass to the component
  const basePath = `/${country}/${locale}`;

  // Fetch items server-side
  const items = await listWishlistItems();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Wishlist</h1>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Your wishlist is empty
          </h3>
          <p className="text-gray-500">
            Save items you love to view them later.
          </p>
        </div>
      ) : (
        <WishlistList items={items} basePath={basePath} />
      )}
    </div>
  );
}
