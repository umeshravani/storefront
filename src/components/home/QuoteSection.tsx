import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Quote } from "lucide-react";

interface QuoteSectionProps {
    basePath: string;
}

export function QuoteSection({ basePath }: QuoteSectionProps) {
    return (
        // Changed flex-col to flex-col-reverse for mobile order inversion
        <section className="flex flex-col-reverse md:flex-row w-full bg-white overflow-hidden">

            {/* Left side: Quote Content */}
            <div className="flex-1 flex items-center justify-center p-8 md:p-16 lg:p-24 bg-white">
                <div className="max-w-lg text-center md:text-left">
                    <Quote className="w-12 h-12 text-gray-200 mb-6 mx-auto md:mx-0" fill="currentColor" />

                    <blockquote className="text-3xl md:text-4xl font-medium text-gray-900 leading-[1.2] mb-6 tracking-tight">
                        "Good art is not always liked, but it is always great."
                    </blockquote>

                    <p className="text-gray-500 mb-8 font-medium">— Team Artolika.Inc</p>

                    <Button asChild className="rounded-full h-12 px-8 bg-black hover:bg-gray-800 text-white font-medium">
                        <Link href={`${basePath}/products`}>Shop Works of Art</Link>
                    </Button>
                </div>
            </div>

            {/* Right side: Lifestyle Image */}
            <div className="flex-1 relative min-h-[300px] md:min-h-[500px]">
                <Image
                    src="/images/homepage/homepageframe.webp"
                    alt="Gallery wall with artwork and furniture"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                />
            </div>
        </section>
    );
}
