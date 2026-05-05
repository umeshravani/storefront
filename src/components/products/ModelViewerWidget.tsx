"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

declare global {
    namespace JSX {
        interface IntrinsicElements {
            "model-viewer": any;
        }
    }
}

interface InteractiveColor {
    name: string;
    hex: string;
}

interface MaterialConfig {
    meshName: string;
    displayName?: string;
    metalness: number;
    roughness: number;
    baseColor?: string | null;
    textureUrl?: string | null;
    interactiveColors: InteractiveColor[];
}

interface ThreeDConfig {
    modelUrl: string;
    materials: MaterialConfig[];
}

interface ModelViewerWidgetProps {
    config: ThreeDConfig;
}

export default function ModelViewerWidget({ config }: ModelViewerWidgetProps) {
    const viewerRef = useRef<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Apply textures, PBR settings, and Defaults when the model loads
    useEffect(() => {
        const viewer = viewerRef.current;
        if (!viewer) return;

        const applyMaterials = async () => {
            if (!viewer.model) return;

            for (const mat of config.materials) {
                const materialInstance = viewer.model.getMaterialByName(mat.meshName);
                if (!materialInstance) continue;

                // 1. Apply Universal Metalness & Roughness
                materialInstance.pbrMetallicRoughness.setMetallicFactor(mat.metalness);
                materialInstance.pbrMetallicRoughness.setRoughnessFactor(mat.roughness);

                // 2. Apply Custom Image Textures (Overrides)
                if (mat.textureUrl) {
                    try {
                        const texture = await viewer.createTexture(mat.textureUrl);
                        materialInstance.pbrMetallicRoughness.baseColorTexture.setTexture(texture);
                    } catch (e) {
                        console.error("Failed to load texture for", mat.meshName);
                    }
                }

                // 3. Apply the "Default Color" you selected in the Admin Panel!
                if (mat.baseColor && !mat.textureUrl) {
                    materialInstance.pbrMetallicRoughness.setBaseColorFactor(mat.baseColor);
                }
            }
            setIsLoaded(true);
        };

        viewer.addEventListener("load", applyMaterials);
        return () => viewer.removeEventListener("load", applyMaterials);
    }, [config]);

    // React cleanly handles our color button clicks!
    const handleColorClick = (meshName: string, hexCode: string) => {
        const viewer = viewerRef.current;
        if (viewer && viewer.model) {
            const materialInstance = viewer.model.getMaterialByName(meshName);
            if (materialInstance) {
                materialInstance.pbrMetallicRoughness.setBaseColorFactor(hexCode);
            }
        }
    };

    return (
        <>
            <Script
                type="module"
                src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"
                strategy="afterInteractive"
            />

            <div className="relative w-full aspect-[4/5] bg-gray-50 rounded-lg overflow-hidden border">
                <model-viewer
                    ref={viewerRef}
                    src={config.modelUrl}
                    ar
                    ar-placement="wall"
                    camera-controls
                    touch-action="pan-y"
                    crossorigin="anonymous"
                    style={{ width: "100%", height: "100%" }}
                    alt="3D AR View"
                >
                    {/* Native AR Button Override */}
                    <button
                        slot="ar-button"
                        className="absolute bottom-4 right-4 bg-black text-white px-4 py-2 rounded-full shadow-lg font-medium text-sm z-10 hover:bg-gray-800 transition"
                    >
                        View in your space (AR)
                    </button>

                    {/* Floating Glass-Morphism Color Controls */}
                    {isLoaded && (
                        <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-3">
                            {config.materials.map((mat, idx) => {
                                if (mat.interactiveColors.length === 0) return null;

                                return (
                                    <div key={idx} className="bg-white/80 backdrop-blur-md border border-white/40 shadow-lg p-3 rounded-2xl">
                                        <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                                            {mat.displayName || mat.meshName}
                                        </span>
                                        <div className="flex flex-wrap gap-2">
                                            {mat.interactiveColors.map((color, cIdx) => (
                                                <button
                                                    key={cIdx}
                                                    onClick={() => handleColorClick(mat.meshName, color.hex)}
                                                    title={color.name}
                                                    className="w-8 h-8 rounded-full border border-gray-200 shadow-sm hover:scale-110 transition-transform active:scale-95"
                                                    style={{ backgroundColor: color.hex }}
                                                    aria-label={`Select ${color.name}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </model-viewer>
            </div>
        </>
    );
}
