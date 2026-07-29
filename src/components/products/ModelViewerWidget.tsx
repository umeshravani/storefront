"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

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
  appearance: "color" | "text";
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
  const initialHasOverrides = config.materials.some(
    (m) =>
      m.baseColor ||
      m.baseTextureUrl ||
      m.normalTextureUrl ||
      m.metallicRoughnessUrl ||
      m.emissiveTextureUrl ||
      m.occlusionTextureUrl,
  );

  const [activeIosSrc, setActiveIosSrc] = useState<string | undefined>(
    initialHasOverrides ? undefined : config.usdzUrl || undefined,
  );

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    // Reset loading state if config/model changes
    setIsLoaded(false);

    const applyMaterials = async () => {
      if (!viewer.model) return;

      // 1. FAST SYNC PASS: Apply all colors and factors instantly to avoid race conditions
      config.materials.forEach((mat) => {
        const materialInstance = viewer.model.getMaterialByName(mat.meshName);
        if (!materialInstance) return;

        try {
          if (mat.baseColor)
            materialInstance.pbrMetallicRoughness.setBaseColorFactor(
              mat.baseColor,
            );
          if (mat.metalness !== undefined && mat.metalness !== null)
            materialInstance.pbrMetallicRoughness.setMetallicFactor(
              mat.metalness,
            );
          if (mat.roughness !== undefined && mat.roughness !== null)
            materialInstance.pbrMetallicRoughness.setRoughnessFactor(
              mat.roughness,
            );
          if (mat.emissiveColor)
            materialInstance.emissiveFactor = mat.emissiveColor;
        } catch (e) {
          console.warn(
            `[ModelViewer] Error setting properties for ${mat.meshName}:`,
            e,
          );
        }
      });

      // 2. ASYNC PASS: Fetch and apply all textures in parallel
      const texturePromises = config.materials.map(async (mat) => {
        const materialInstance = viewer.model.getMaterialByName(mat.meshName);
        if (!materialInstance) return;

        // Explicitly declare 'color' (sRGB) or 'data' (Linear) for AR compatibility
        const applyTex = async (
          url: string,
          targetMap: any,
          type: "color" | "data" = "color",
        ) => {
          try {
            if (!targetMap) return;
            const tex = await viewer.createTexture(url, type);
            targetMap.setTexture(tex);
          } catch (e) {
            console.warn(
              `[ModelViewer] Failed to load texture for ${mat.meshName}:`,
              e,
            );
          }
        };

        const tasks = [];

        // Base Color & Emissive are standard sRGB visuals ('color')
        if (mat.baseTextureUrl)
          tasks.push(
            applyTex(
              mat.baseTextureUrl,
              materialInstance.pbrMetallicRoughness.baseColorTexture,
              "color",
            ),
          );

        if (mat.emissiveTextureUrl) {
          tasks.push(
            applyTex(
              mat.emissiveTextureUrl,
              materialInstance.emissiveTexture,
              "color",
            ),
          );
          // Force the base factor to white so the glow map isn't multiplied by black (invisible)
          materialInstance.emissiveFactor = [1, 1, 1];
        }

        // Normal & Occlusion must be mathematical data vectors ('data')
        if (mat.normalTextureUrl)
          tasks.push(
            applyTex(
              mat.normalTextureUrl,
              materialInstance.normalTexture,
              "data",
            ),
          );
        if (mat.occlusionTextureUrl)
          tasks.push(
            applyTex(
              mat.occlusionTextureUrl,
              materialInstance.occlusionTexture,
              "data",
            ),
          );

        // ORM (Occlusion/Roughness/Metalness) must be mathematical data vectors ('data')
        if (mat.metallicRoughnessUrl) {
          tasks.push(
            applyTex(
              mat.metallicRoughnessUrl,
              materialInstance.pbrMetallicRoughness.metallicRoughnessTexture,
              "data",
            ),
          );
          // Force the base factors to 1.0 so they don't multiply/erase the map data
          materialInstance.pbrMetallicRoughness.setMetallicFactor(1.0);
          materialInstance.pbrMetallicRoughness.setRoughnessFactor(1.0);
        }

        await Promise.all(tasks);
      });

      await Promise.all(texturePromises);
      setIsLoaded(true);
    };

    // Cache bypass: Fire immediately if model is already loaded, otherwise wait for event
    if (viewer.model) {
      applyMaterials();
    } else {
      viewer.addEventListener("load", applyMaterials);
    }

    return () => viewer.removeEventListener("load", applyMaterials);
  }, [config]);

  const handleColorClick = (targetMeshes: string[], hexCode: string) => {
    const viewer = viewerRef.current;
    if (viewer?.model) {
      targetMeshes.forEach((meshName) => {
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
        <div
          className={`absolute inset-0 z-50 flex items-center justify-center bg-gray-50/90 backdrop-blur-md transition-opacity duration-700 pointer-events-none ${isLoaded ? "opacity-0" : "opacity-100"}`}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Loading 3D Experience...
            </span>
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
                <div
                  key={idx}
                  className="bg-white/80 backdrop-blur-md border border-white/40 shadow-lg p-3 rounded-2xl"
                >
                  <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    {group.name}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {group.options.map((color, cIdx) =>
                      group.appearance === "text" ? (
                        <button
                          key={cIdx}
                          onClick={() =>
                            handleColorClick(group.targetMeshes, color.hex)
                          }
                          className="px-3 py-1.5 rounded-md border border-gray-300 shadow-sm text-xs font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all bg-white"
                          aria-label={`Select ${color.name}`}
                        >
                          {color.name}
                        </button>
                      ) : (
                        <button
                          key={cIdx}
                          onClick={() =>
                            handleColorClick(group.targetMeshes, color.hex)
                          }
                          title={color.name}
                          className="w-8 h-8 rounded-full border border-gray-200 shadow-sm hover:scale-110 transition-transform active:scale-95"
                          style={{ backgroundColor: color.uiHex }}
                          aria-label={`Select ${color.name}`}
                        />
                      ),
                    )}
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
