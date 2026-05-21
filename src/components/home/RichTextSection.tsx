import Link from "next/link";
import { Button } from "@/components/ui/button";

interface RichTextSectionProps {
    basePath: string;
}

export function RichTextSection({ basePath }: RichTextSectionProps) {
    return (
        <section className="w-full bg-white py-16 md:py-24 px-4">
            <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
                {/* Subheading */}
                <p className="text-xs font-bold tracking-[0.2em] text-gray-500 uppercase mb-4">
                    Art that lives with you
                </p>

                {/* Main Heading */}
                <h2 className="text-4xl md:text-5xl font-medium text-gray-900 mb-6 leading-tight">
                    Where Every Frame Tells a Story
                </h2>

                {/* Description */}
                <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed">
                    From modern prints to rare originals, explore a curated collection that celebrates creativity, color, and culture.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <Button asChild size="lg" className="h-12 px-8 bg-black hover:bg-gray-800 text-white rounded-full">
                        <Link href={`${basePath}/products`}>Shop Works of Art</Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="h-12 px-8 rounded-full border-black hover:bg-gray-50">
                        <Link href={`${basePath}/artists`}>Discover Artists</Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
