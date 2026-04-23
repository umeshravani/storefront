"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface HeroSliderProps {
  basePath: string;
  shopNowText: string;
}

export function HeroSlider({ basePath, shopNowText }: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "A Legacy of Art, Framed for Eternity",
      description: "Transform your space with our timeless artistry. Shop now for the best in indian art innovation",
      // Desktop image (Landscape)
      image: "https://thewallx.com/images/slider/01%20Slider%20WallX.webp", 
      // Mobile image (Portrait) - Replace with your actual mobile URL
      mobileImage: "https://thewallx.com/images/slider/mobile/01%20Slider%20WallX.webp", 
      ctaUrl: `${basePath}/products?category=frames`,
      ctaText: "Start Framing",
    },
    {
      title: "Art That Speaks, Frames That Impress",
      description: "Elevate your space with meticulously crafted frames designed to enhance the beauty of every masterpiece.",
      image: "https://thewallx.com/images/slider/04%20Slider%20WallX.webp",
      mobileImage: "https://thewallx.com/images/slider/mobile/04%20Slider%20WallX.webp",
      ctaUrl: `${basePath}/products?category=hardware`,
      ctaText: "Explore Collection",
    },
    {
      title: "Timeless Art in Luxurious Frames",
      description: "Step into a world of sophistication with premium frames that bring depth, richness, and lasting beauty to your collection.",
      image: "https://thewallx.com/images/slider/03%20Slider%20WallX.webp",
      mobileImage: "https://thewallx.com/images/slider/mobile/03%20Slider%20WallX.webp",
      ctaUrl: `${basePath}/products?sale=true`,
      ctaText: "Shop The Sale",
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative w-full h-[80vh] min-h-[500px] max-h-[900px] bg-gray-900 overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          {/* DESKTOP Background Image (Hidden on mobile) */}
          <div 
            className={`hidden md:block absolute inset-0 bg-cover bg-center transition-transform duration-[6000ms] ease-out ${
              index === currentSlide ? "scale-100" : "scale-105"
            }`}
            style={{ backgroundImage: `url(${slide.image})` }}
          />
          
          {/* MOBILE Background Image (Hidden on desktop) */}
          <div 
            className={`block md:hidden absolute inset-0 bg-cover bg-center transition-transform duration-[6000ms] ease-out ${
              index === currentSlide ? "scale-100" : "scale-105"
            }`}
            style={{ backgroundImage: `url(${slide.mobileImage})` }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />

          {/* Content Container */}
          <div className="relative h-full container mx-auto px-6 md:px-12 lg:px-16 flex flex-col justify-end items-start text-left pb-24 md:pb-32">
            <div 
              className={`max-w-2xl transform transition-all duration-1000 delay-300 ${
                index === currentSlide ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
            >
              <h1 className="text-2xl md:text-3xl lg:text-3xl font-bold text-white tracking-tight mb-6 leading-tight drop-shadow-lg">
                {slide.title}
              </h1>
              <p className="text-sm md:text-base lg:text-base text-gray-200 mb-10 leading-relaxed max-w-xl drop-shadow-md">
                {slide.description}
              </p>
              <Button 
                size="sm" 
                className="bg-white text-gray-900 hover:bg-gray-200 px-6 py-6 text-xs md:text-sm font-semibold uppercase tracking-wider rounded-4xl transition-colors shadow-lg" 
                asChild
              >
                <Link href={slide.ctaUrl}>{slide.ctaText}</Link>
              </Button>
            </div>
          </div>
        </div>
      ))}

      {/* Modern Navigation Dots */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1.5 transition-all duration-500 rounded-full ${
              index === currentSlide ? "w-10 bg-white" : "w-3 bg-white/40 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
