// src/components/home/IconBox.tsx
import Image from "next/image";

export function IconBox() {
    const features = [
        {
            title: "Pixel Perfect",
            subtitle: "Hi-Quality Print",
            icon: "https://app.thewallx.com/images/Pixel%20Perfect.svg",
        },
        {
            title: "Aluminium",
            subtitle: "6063 Grade Alloy",
            icon: "https://app.thewallx.com/images/Aluminium%20Block.svg",
        },
        {
            title: "Anti Corrosion",
            subtitle: "Wear Resistance",
            icon: "https://app.thewallx.com/images/Anti%20Corrosion.svg",
        },
        {
            title: "Try-VR™",
            subtitle: "Experience in 3D",
            icon: "https://app.thewallx.com/images/VR%203D.svg",
        },
    ];

    return (
        <section className="w-full bg-white py-8 md:py-12 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4 text-center">
                    {features.map((feature, index) => (
                        <div key={index} className="flex flex-col items-center justify-center">
                            <img
                                src={feature.icon}
                                alt={feature.title}
                                width={48}
                                height={48}
                                className="mb-4"
                            />
                            <h3 className="text-[15px] font-semibold text-gray-900 m-0">
                                {feature.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1 m-0">
                                {feature.subtitle}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
