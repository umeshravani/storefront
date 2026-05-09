// src/components/home/CategorySlider.tsx
import Link from "next/link";

export function CategorySlider() {
    const cards = [
        { title: "Acrylic Poster", image: "/images/cards/Acrylic_Bedroom_Elephants_WallX.webp", link: "#" },
        { title: "Framed Art", image: "/images/cards/Framed_Art_Living_Room_Gold.webp", link: "#" },
        { title: "LED Framed Art", image: "/images/cards/Enterance_Hall_LED_Wall_Art_Mockup_Gold.webp", link: "#" },
        { title: "Multi Frame Art", image: "/images/cards/Trio_Frames.webp", link: "#" },
        { title: "Backlight Art", image: "/images/cards/Stretch_Backlight_Room_Blue_WallX.webp", link: "#" },
        { title: "Stretch Ceiling", image: "/images/cards/Ceiling_Stretch_Fabric_Mockup_HD_WallX.webp", link: "#" },
    ];

    return (
        <section className="w-full bg-gray-50 py-10 md:py-16 overflow-hidden">
            <div className="max-w-[2000px] mx-auto">

                {/* Horizontal Scroll Container */}
                <div
                    className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-5 px-4 md:px-8 pb-8 pt-4
          /* Hide scrollbar styles */
          [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
                    {cards.map((card, index) => (
                        <Link
                            href={card.link}
                            key={index}
                            className="group relative flex-shrink-0 snap-center md:snap-start overflow-hidden rounded-xl bg-gray-200
                /* Responsive Widths & Aspect Ratio (matching your 268.75 / 388.19) */
                w-[160px] md:w-[220px] lg:w-[268px] aspect-[268/388]
                /* Subtle hover lift */
                transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
                        >
                            {/* Background Image */}
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                                style={{ backgroundImage: `url(${card.image})` }}
                            />

                            {/* Gradient Overlay (Dark at bottom) */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                            {/* Card Title */}
                            <div className="absolute bottom-6 left-0 right-0 px-4 text-center">
                                <h3 className="text-white font-bold text-sm md:text-base tracking-wide">
                                    {card.title}
                                </h3>
                            </div>
                        </Link>
                    ))}
                </div>

            </div>
        </section>
    );
}
