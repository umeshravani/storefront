"use client";

import React, { useState, useEffect, useRef } from "react";

// Star SVG Component
const StarIcon = ({ filled = true, className = "" }) => (
  <svg
    className={`h-4 w-4 shrink-0 ${filled ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"} ${className}`}
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z" />
  </svg>
);

export default function ProductReviews({
  productId,
  productName,
  slug,
}: {
  productId: string;
  productName: string;
  slug: string;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState({
    average: 0,
    totalCount: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<number, number>,
  });

  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(5);

  // Fallback if env variable is missing during dev
  const NEXT_PUBLIC_SPREE_API_URL = process.env.NEXT_PUBLIC_SPREE_API_URL || "https://thewallx.com";

  // 1. Fetch Data
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${NEXT_PUBLIC_SPREE_API_URL}/api/v3/store/products/${slug}/product_reviews`);
        if (!res.ok) throw new Error("Failed to fetch reviews");
        
        const json = await res.json();

        if (json.data) {
          const fetchedReviews = json.data;
          setReviews(fetchedReviews);

          // Calculate Summary based on actual data
          if (fetchedReviews.length > 0) {
            let sum = 0;
            const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<number, number>;
            
            fetchedReviews.forEach((r: any) => {
              sum += r.rating;
              dist[r.rating] = (dist[r.rating] || 0) + 1;
            });

            setSummary({
              average: Number((sum / fetchedReviews.length).toFixed(1)),
              totalCount: json.meta.total_count || fetchedReviews.length,
              distribution: dist,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReviews();
  }, [slug, NEXT_PUBLIC_SPREE_API_URL]);

  // 2. Submit Review Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(formRef.current!);
    formData.append("product_review[rating]", rating.toString());

    try {
      const res = await fetch(`${NEXT_PUBLIC_SPREE_API_URL}/api/v3/store/products/${slug}/product_reviews`, {
        method: "POST",
        body: formData,
        // Note: Headers for auth/publishable keys can be added here if needed
      });

      if (res.ok) {
        alert("Review submitted successfully! It is pending approval.");
        setIsModalOpen(false);
        formRef.current?.reset();
      } else {
        const error = await res.json();
        alert(error.error || "Error submitting review.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="py-16 text-center text-gray-500">Loading reviews...</div>;
  }

  return (
    <section className="bg-white py-8 antialiased dark:bg-gray-900 md:py-16">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        
        {/* --- HEADER --- */}
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Customer Reviews
          </h2>
          {summary.totalCount > 0 && (
            <div className="mt-2 flex items-center gap-2 sm:mt-0">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} filled={i < Math.round(summary.average)} />
                ))}
              </div>
              <p className="text-sm font-medium leading-none text-gray-500 dark:text-gray-400">
                ({summary.average})
              </p>
              <span className="text-sm font-medium leading-none text-gray-900 dark:text-white">
                {summary.totalCount} Reviews
              </span>
            </div>
          )}
        </div>

        {/* --- SUMMARY DISTRIBUTION --- */}
        <div className="my-6 gap-8 sm:flex sm:items-start md:my-8">
          <div className="shrink-0 space-y-4">
            <p className="text-2xl font-semibold leading-none text-gray-900 dark:text-white">
              {summary.totalCount > 0 ? `${summary.average} out of 5` : "No reviews yet"}
            </p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mb-2 me-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Write a review
            </button>
          </div>

          {summary.totalCount > 0 && (
            <div className="mt-6 min-w-0 flex-1 space-y-3 sm:mt-0">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = summary.distribution[stars] || 0;
                const percentage = summary.totalCount > 0 ? (count / summary.totalCount) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-2">
                    <p className="w-2 shrink-0 text-start text-sm font-medium leading-none text-gray-900 dark:text-white">
                      {stars}
                    </p>
                    <StarIcon />
                    <div className="h-1.5 w-80 rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-1.5 rounded-full bg-yellow-400"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="w-8 shrink-0 text-right text-sm font-medium leading-none text-blue-700 dark:text-blue-500 sm:w-auto sm:text-left">
                      {count} <span className="hidden sm:inline">reviews</span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* --- ACTUAL REVIEWS LIST --- */}
        <div className="mt-6 divide-y divide-gray-200 dark:divide-gray-700">
          {reviews.map((review) => (
            <div key={review.id} className="gap-3 pb-6 sm:flex sm:items-start pt-6">
              {/* Left Column (Stars, Author, Date, Badge) */}
              <div className="shrink-0 space-y-2 sm:w-48 md:w-72">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} filled={i < review.rating} />
                  ))}
                </div>
                
                <div className="space-y-0.5">
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {review.reviewer_name || "Anonymous"}
                  </p>
                  <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    {new Intl.DateTimeFormat('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }).format(new Date(review.created_at))}
                  </p>
                </div>

                {review.is_verified_purchase && (
                  <div className="inline-flex items-center gap-1">
                    <svg className="h-5 w-5 text-green-600 dark:text-green-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2c-.791 0-1.55.314-2.11.874l-.893.893a.985.985 0 0 1-.696.288H7.04A2.984 2.984 0 0 0 4.055 7.04v1.262a.986.986 0 0 1-.288.696l-.893.893a2.984 2.984 0 0 0 0 4.22l.893.893a.985.985 0 0 1 .288.696v1.262a2.984 2.984 0 0 0 2.984 2.984h1.262c.261 0 .512.104.696.288l.893.893a2.984 2.984 0 0 0 4.22 0l.893-.893a.985.985 0 0 1 .696-.288h1.262a2.984 2.984 0 0 0 2.984-2.984V15.7c0-.261.104-.512.288-.696l.893-.893a2.984 2.984 0 0 0 0-4.22l-.893-.893a.985.985 0 0 1-.288-.696V7.04a2.984 2.984 0 0 0-2.984-2.984h-1.262a.985.985 0 0 1-.696-.288l-.893-.893A2.984 2.984 0 0 0 12 2Zm3.683 7.73a1 1 0 1 0-1.414-1.413l-4.253 4.253-1.277-1.277a1 1 0 0 0-1.415 1.414l1.985 1.984a1 1 0 0 0 1.414 0l4.96-4.96Z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Verified purchase</p>
                  </div>
                )}
              </div>

              {/* Right Column (Text, Images) */}
              <div className="mt-4 min-w-0 flex-1 space-y-4 sm:mt-0">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">{review.title}</h4>
                <p className="text-base font-normal text-gray-500 dark:text-gray-400 whitespace-pre-wrap">
                  {review.review}
                </p>

                {/* Render Attached Media */}
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 mt-4 flex-wrap">
                    {review.images.map((img: any) => {
                      const absoluteUrl = `${NEXT_PUBLIC_SPREE_API_URL}${img.url}`;
                      return (
                        <div key={img.id} className="h-24 w-24 sm:h-32 sm:w-32 rounded-lg border bg-gray-100 overflow-hidden shrink-0">
                          {img.content_type.startsWith("video") ? (
                            <video src={absoluteUrl} className="h-full w-full object-cover" controls preload="metadata" />
                          ) : (
                            <img src={absoluteUrl} alt={img.filename} className="h-full w-full object-cover" loading="lazy" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- ADD REVIEW MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black bg-opacity-50 p-4 antialiased">
          <div className="relative max-h-full w-full max-w-2xl">
            <div className="relative rounded-lg bg-white shadow dark:bg-gray-800">
              {/* Modal Header */}
              <div className="flex items-center justify-between rounded-t border-b border-gray-200 p-4 dark:border-gray-700 md:p-5">
                <div>
                  <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                    Add a review for:
                  </h3>
                  <span className="font-medium text-blue-700 dark:text-blue-500">{productName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  <svg className="h-3 w-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>

              {/* Modal Body / Form */}
              <form ref={formRef} className="p-4 md:p-5" onSubmit={handleSubmit}>
                <div className="mb-4 grid grid-cols-2 gap-4">
                  
                  {/* Rating Selector */}
                  <div className="col-span-2 flex items-center gap-1">
                    <p className="mr-2 text-sm font-medium text-gray-900 dark:text-white">Rating:</p>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div key={star} onClick={() => setRating(star)} className="cursor-pointer">
                        <StarIcon filled={star <= rating} className="hover:scale-110 transition-transform" />
                      </div>
                    ))}
                  </div>

                  <div className="col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">Review title</label>
                    <input type="text" name="product_review[title]" className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-600 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white" required />
                  </div>

                  <div className="col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">Review description</label>
                    <textarea name="product_review[review]" rows={4} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" required></textarea>
                  </div>

                  <div className="col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                      Add photos or video <span className="text-gray-500 font-normal">(Optional)</span>
                    </label>
                    <input type="file" name="product_review[images][]" multiple accept="image/*,video/mp4,video/quicktime,video/webm" className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400" />
                  </div>

                  <div className="col-span-2 flex items-center mt-2">
                    <input type="checkbox" id="show_identifier" name="product_review[show_identifier]" value="1" defaultChecked className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700" />
                    <label htmlFor="show_identifier" className="ms-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Show my name in the review
                    </label>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 dark:border-gray-700 md:pt-5 flex justify-end gap-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700">
                    {isSubmitting ? "Submitting..." : "Add review"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
