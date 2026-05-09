"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

declare global {
    namespace JSX {
        interface IntrinsicElements {
            "model-viewer": any;
        }
    }
    namespace React {
        namespace JSX {
            interface IntrinsicElements {
                "model-viewer": any;
            }
        }
    }
}

interface InteractiveColor {
    name: string;
    hex: string;
    uiHex: string;
}

interface ColorGroup {
    name: string;
    appearance: 'color' | 'text';
    targetMeshes: string[];
    options: InteractiveColor[];
}

interface MaterialConfig {
    meshName: string;
    metalness: number;
    roughness: number;
    baseColor?: string | null;
    emissiveColor?: number[] | string | null;
    baseTextureUrl?: string | null;
    normalTextureUrl?: string | null;
    metallicRoughnessUrl?: string | null;
    emissiveTextureUrl?: string | null;
    occlusionTextureUrl?: string | null;
}

interface ThreeDConfig {
    modelUrl: string;
    usdzUrl?: string | null;
    materials: MaterialConfig[];
    colorGroups: ColorGroup[];
}

interface ModelViewerWidgetProps {
    config: ThreeDConfig;
}

export default function ModelViewerWidget({ config }: ModelViewerWidgetProps) {
    const viewerRef = useRef<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // ==========================================
    // ENTERPRISE AR ROUTING ENGINE
    // ==========================================
    // Check if ANY custom PBR override exists so we can safely eject the static USDZ
    const initialHasOverrides = config.materials.some(m =>
        m.baseColor ||
        m.baseTextureUrl ||
        m.normalTextureUrl ||
        m.metallicRoughnessUrl ||
        m.emissiveTextureUrl ||
        m.occlusionTextureUrl
    );

    const [activeIosSrc, setActiveIosSrc] = useState<string | undefined>(
        initialHasOverrides ? undefined : (config.usdzUrl || undefined)
    );

    useEffect(() => {
        const viewer = viewerRef.current;
        if (!viewer) return;

        const applyMaterials = async () => {
            if (!viewer.model) return;

            for (const mat of config.materials) {
                const materialInstance = viewer.model.getMaterialByName(mat.meshName);
                if (!materialInstance) continue;

                // 1. Base Color & Texture
                if (mat.baseColor) {
                    materialInstance.pbrMetallicRoughness.setBaseColorFactor(mat.baseColor);
                }
                if (mat.baseTextureUrl) {
                    try {
                        const texture = await viewer.createTexture(mat.baseTextureUrl);
                        materialInstance.pbrMetallicRoughness.baseColorTexture.setTexture(texture);
                    } catch (e) { console.error("Failed to load base texture", e); }
                }

                // 2. Metallic & Roughness
                materialInstance.pbrMetallicRoughness.setMetallicFactor(mat.metalness);
                materialInstance.pbrMetallicRoughness.setRoughnessFactor(mat.roughness);
                if (mat.metallicRoughnessUrl) {
                    try {
                        const tex = await viewer.createTexture(mat.metallicRoughnessUrl);
                        materialInstance.pbrMetallicRoughness.metallicRoughnessTexture.setTexture(tex);
                    } catch (e) { console.error("Failed to load metallic-roughness texture", e); }
                }

                // 3. Normal Map
                if (mat.normalTextureUrl) {
                    try {
                        const tex = await viewer.createTexture(mat.normalTextureUrl);
                        materialInstance.normalTexture.setTexture(tex);
                    } catch (e) { console.error("Failed to load normal texture", e); }
                }

                // 4. Emissive (Glowing parts)
                if (mat.emissiveColor) {
                    materialInstance.emissiveFactor = mat.emissiveColor;
                }
                if (mat.emissiveTextureUrl) {
                    try {
                        const tex = await viewer.createTexture(mat.emissiveTextureUrl);
                        materialInstance.emissiveTexture.setTexture(tex);
                    } catch (e) { console.error("Failed to load emissive texture", e); }
                }

                // 5. Occlusion Map
                if (mat.occlusionTextureUrl) {
                    try {
                        const tex = await viewer.createTexture(mat.occlusionTextureUrl);
                        materialInstance.occlusionTexture.setTexture(tex);
                    } catch (e) { console.error("Failed to load occlusion texture", e); }
                }
            }
            setIsLoaded(true);
        };

        viewer.addEventListener("load", applyMaterials);
        return () => viewer.removeEventListener("load", applyMaterials);
    }, [config]);

    const handleColorClick = (targetMeshes: string[], hexCode: string) => {
        const viewer = viewerRef.current;
        if (viewer && viewer.model) {
            targetMeshes.forEach(meshName => {
                const materialInstance = viewer.model.getMaterialByName(meshName);
                if (materialInstance) {
                    materialInstance.pbrMetallicRoughness.setBaseColorFactor(hexCode);
                }
            });

            // Eject the static Apple USDZ file on interaction to force live dynamic AR generation
            setActiveIosSrc(undefined);
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

                {/* Elegant Loading Mask */}
                <div className={`absolute inset-0 z-50 flex items-center justify-center bg-gray-50/90 backdrop-blur-md transition-opacity duration-700 pointer-events-none ${isLoaded ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Optimizing Textures...</span>
                    </div>
                </div>

                <model-viewer
                    ref={viewerRef}
                    src={config.modelUrl}
                    ios-src={activeIosSrc}
                    ar
                    ar-placement="wall"
                    camera-controls
                    touch-action="pan-y"
                    crossorigin="anonymous"
                    style={{ width: "100%", height: "100%" }}
                    alt="3D AR View"
                >
                    <button
                        slot="ar-button"
                        className="absolute bottom-4 right-4 bg-black text-white px-4 py-2 rounded-full shadow-lg font-medium text-sm z-10 hover:bg-gray-800 transition"
                    >
                        View in your space (AR)
                    </button>

                    {isLoaded && config.colorGroups && config.colorGroups.length > 0 && (
                        <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-3">
                            {config.colorGroups.map((group, idx) => (
                                <div key={idx} className="bg-white/80 backdrop-blur-md border border-white/40 shadow-lg p-3 rounded-2xl">
                                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                                        {group.name}
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {group.options.map((color, cIdx) => (
                                            group.appearance === 'text' ? (
                                                <button
                                                    key={cIdx}
                                                    onClick={() => handleColorClick(group.targetMeshes, color.hex)}
                                                    className="px-3 py-1.5 rounded-md border border-gray-300 shadow-sm text-xs font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all bg-white"
                                                    aria-label={`Select ${color.name}`}
                                                >
                                                    {color.name}
                                                </button>
                                            ) : (
                                                <button
                                                    key={cIdx}
                                                    onClick={() => handleColorClick(group.targetMeshes, color.hex)}
                                                    title={color.name}
                                                    className="w-8 h-8 rounded-full border border-gray-200 shadow-sm hover:scale-110 transition-transform active:scale-95"
                                                    style={{ backgroundColor: color.uiHex }}
                                                    aria-label={`Select ${color.name}`}
                                                />
                                            )
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </model-viewer>
            </div>
        </>
    );
}
