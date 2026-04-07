import { useIsFocused } from "@react-navigation/native";
import { useAnimations, useGLTF } from "@react-three/drei/native";
import { Canvas, useFrame } from "@react-three/fiber/native";
import React, { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

// ====================================================================
// --- iOS / HERMES TEXTURE FIX ---
// Problem: GLTFLoader calls response.blob() then URL.createObjectURL(blob)
// to load embedded textures. On iOS/Hermes, native Blobs cannot be read
// back as data URLs, causing the corrupted purple/pixel-noise appearance.
//
// Fix: Patch the global fetch so that any response whose URL looks like
// a GLB-embedded image (or any binary asset) returns a fake response
// whose .blob() hands back a data-URI-based object that Three.js CAN read.
// ====================================================================
if (Platform.OS !== "web" && !(global as any).__iosTexturePatchApplied) {
  (global as any).__iosTexturePatchApplied = true;

  // Helper: ArrayBuffer → base64 string (pure JS, no btoa size limit)
  function bufferToBase64(buffer: ArrayBuffer): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    const bytes = new Uint8Array(buffer);
    const len = bytes.length;
    let base64 = "";
    for (let i = 0; i < len; i += 3) {
      base64 += chars[bytes[i] >> 2];
      base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
      base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
      base64 += chars[bytes[i + 2] & 63];
    }
    const pad = len % 3;
    if (pad === 1) base64 = base64.slice(0, -2) + "==";
    else if (pad === 2) base64 = base64.slice(0, -1) + "=";
    return base64;
  }

  // Sniff MIME type from the first bytes of the buffer
  function sniffMime(buffer: ArrayBuffer): string {
    const b = new Uint8Array(buffer, 0, Math.min(12, buffer.byteLength));
    // PNG: 89 50 4E 47
    if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47)
      return "image/png";
    // JPEG: FF D8 FF
    if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
    // WebP: RIFF....WEBP
    if (
      b[0] === 0x52 &&
      b[1] === 0x49 &&
      b[2] === 0x46 &&
      b[3] === 0x46 &&
      b[8] === 0x57 &&
      b[9] === 0x45 &&
      b[10] === 0x42 &&
      b[11] === 0x50
    )
      return "image/webp";
    // KTX2: AB 4B 54 58 (basis/ktx textures sometimes embedded in glb)
    if (b[0] === 0xab && b[1] === 0x4b && b[2] === 0x54 && b[3] === 0x58)
      return "image/ktx2";
    return "application/octet-stream";
  }

  // Wrap fetch so every response gets a patched .blob() that returns
  // a plain object with a data-URI .uri that Three.js / expo-three can use.
  const originalFetch = global.fetch;
  (global as any).fetch = async function patchedFetch(
    input: RequestInfo,
    init?: RequestInit,
  ) {
    const response = await originalFetch(input, init);

    // Only patch binary-ish responses (GLB chunks, images).
    // Leave JSON, text, etc. untouched.
    const contentType = response.headers?.get("content-type") ?? "";
    const isTextLike =
      contentType.includes("application/json") || contentType.includes("text/");
    if (isTextLike) return response;

    // Clone so the original body stream isn't consumed.
    const cloned = response.clone();

    const patchedResponse = new Proxy(response, {
      get(target, prop) {
        if (prop === "blob") {
          return async () => {
            const buffer = await cloned.arrayBuffer();
            const mime = sniffMime(buffer);
            const b64 = bufferToBase64(buffer);
            const dataUri = `data:${mime};base64,${b64}`;

            // Return a fake Blob-like object.
            // Three.js's ImageLoader ultimately calls
            // URL.createObjectURL(blob) or reads blob.uri directly
            // via expo-three's patched loader — both paths are covered.
            return {
              isDataURIBlob: true,
              type: mime,
              size: buffer.byteLength,
              uri: dataUri,
              // FileReader.readAsDataURL path
              _dataURL: dataUri,
              // Fallback arrayBuffer path
              arrayBuffer: async () => buffer,
              text: async () => "",
              stream: () => null,
              slice: () => null,
            };
          };
        }

        if (prop === "arrayBuffer") {
          return () => cloned.arrayBuffer();
        }

        const value = (target as any)[prop];
        return typeof value === "function" ? value.bind(target) : value;
      },
    });

    return patchedResponse;
  };

  // Also patch URL.createObjectURL so if Three.js calls it with our
  // fake blob it gets the data URI right back.
  const originalCreateObjectURL = (global as any).URL?.createObjectURL?.bind?.(
    (global as any).URL,
  );
  if ((global as any).URL) {
    (global as any).URL.createObjectURL = function (blob: any) {
      if (blob?.isDataURIBlob) return blob.uri;
      if (blob?._dataURL) return blob._dataURL;
      return originalCreateObjectURL ? originalCreateObjectURL(blob) : "";
    };
  }

  // Patch FileReader so readAsDataURL works with our fake blob too.
  const OriginalFileReader = (global as any).FileReader;
  if (OriginalFileReader) {
    (global as any).FileReader = class PatchedFileReader extends (
      OriginalFileReader
    ) {
      readAsDataURL(blob: any) {
        if (blob?.isDataURIBlob || blob?._dataURL) {
          // Simulate async onload
          setTimeout(() => {
            (this as any).result = blob._dataURL ?? blob.uri;
            this.onload?.({ target: this } as any);
          }, 0);
          return;
        }
        super.readAsDataURL(blob);
      }
    };
  }
}
// ====================================================================

export type SparkyMood =
  | "default"
  | "happy"
  | "thinking"
  | "sad"
  | "excited"
  | "speaking";

interface SparkyProps {
  size?: number;
  mood?: SparkyMood;
  showRing?: boolean;
  ringColor?: string;
  showShadow?: boolean;
}

function moodRingColor(mood: SparkyMood): string {
  switch (mood) {
    case "excited":
      return "#FFE0EC";
    case "thinking":
      return "#E8E5FF";
    case "sad":
      return "#D6EFFF";
    case "speaking":
      return "#E0FFF0";
    case "happy":
      return "#FFF5D6";
    default:
      return "#EAE8FF";
  }
}

function moodRingBorder(mood: SparkyMood): string {
  switch (mood) {
    case "excited":
      return "#FFB3CF";
    case "thinking":
      return "#C3BDFF";
    case "sad":
      return "#93CFEE";
    case "speaking":
      return "#7CE8B0";
    case "happy":
      return "#FFDB85";
    default:
      return "#C3BDFF";
  }
}

// ==========================================================
// --- 3D MODEL COMPONENT
// ==========================================================
function Sparky3DModel({ mood }: { mood: SparkyMood }) {
  const gltf = useGLTF(require("../assets/models/sparky.glb"));
  const { scene, animations } = Array.isArray(gltf) ? gltf[0] : gltf;
  const { actions } = useAnimations(animations, scene);

  useEffect(() => {
    let animName = "Idle Animation";
    if (mood === "sad" && actions["Sit (Static)"]) animName = "Sit (Static)";
    else if (mood === "excited" && actions["Pose (Static)"])
      animName = "Pose (Static)";
    else if (mood === "thinking" && actions["Stretch (Static)"])
      animName = "Stretch (Static)";

    const action = actions[animName] ?? actions["Idle Animation"];
    if (action) {
      action.reset().fadeIn(0.3).play();
      return () => {
        action.fadeOut(0.3);
      };
    }
  }, [mood, actions]);

  useFrame((state) => {
    scene.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
  });

  return (
    <primitive
      object={scene}
      scale={2.7}
      position={[0, -4.5, 0]}
      dispose={null}
    />
  );
}

// ==========================================================
// --- MAIN MASCOT WRAPPER
// ==========================================================
export const SparkyMascot: React.FC<SparkyProps> = ({
  size = 100,
  mood = "default",
  showRing = false,
  ringColor,
  showShadow = true,
}) => {
  const isFocused = useIsFocused();

  const translateY = useSharedValue(0);
  const scaleX = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withTiming(0, { duration: 100 });
    scaleX.value = withSpring(1);

    if (mood === "excited") {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-16, {
            duration: 300,
            easing: Easing.out(Easing.back(3)),
          }),
          withTiming(0, { duration: 300, easing: Easing.in(Easing.ease) }),
        ),
        -1,
        false,
      );
      rotation.value = withRepeat(
        withSequence(
          withTiming(-8, { duration: 180 }),
          withTiming(8, { duration: 180 }),
          withTiming(0, { duration: 180 }),
        ),
        -1,
        false,
      );
    } else if (mood === "thinking") {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-6, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );
      rotation.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 1200 }),
          withTiming(5, { duration: 1200 }),
        ),
        -1,
        true,
      );
    } else if (mood === "sad") {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-4, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );
    } else if (mood === "speaking") {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-8, { duration: 400 }),
          withTiming(-2, { duration: 400 }),
          withTiming(-8, { duration: 400 }),
          withTiming(0, { duration: 600 }),
        ),
        -1,
        false,
      );
    } else {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-10, {
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );
    }
  }, [mood]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
      { scaleX: scaleX.value },
    ],
  }));

  const shadowScale = useSharedValue(1);
  useEffect(() => {
    shadowScale.value = withRepeat(
      withSequence(
        withTiming(0.55, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, []);

  const shadowStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: shadowScale.value }],
    opacity: 0.18 + shadowScale.value * 0.12,
  }));

  const resolvedRingColor = ringColor ?? moodRingColor(mood);
  const resolvedBorderColor = moodRingBorder(mood);

  return (
    <View style={[{ width: size, height: size + size * 0.15 }, styles.wrapper]}>
      {showRing && (
        <View
          style={[
            styles.ring,
            {
              width: size * 0.88,
              height: size * 0.88,
              borderRadius: size * 0.44,
              backgroundColor: resolvedRingColor,
              borderColor: resolvedBorderColor,
              top: size * 0.04,
            },
          ]}
        />
      )}

      <Animated.View
        style={[
          { width: size, height: size, alignSelf: "center" },
          styles.canvasContainer,
          animatedStyle,
        ]}
      >
        {isFocused && (
          <Canvas camera={{ position: [0, 0.8, 3.0], fov: 50 }}>
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 10, 5]} intensity={1} />
            <directionalLight
              position={[-4, 2, -3]}
              intensity={0.4}
              color="#c8b8ff"
            />
            <React.Suspense fallback={null}>
              <Sparky3DModel mood={mood} />
            </React.Suspense>
          </Canvas>
        )}
      </Animated.View>

      {showShadow && (
        <Animated.View
          style={[
            styles.shadow,
            { width: size * 0.5, borderRadius: size * 0.25 },
            shadowStyle,
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "flex-start",
    overflow: "visible",
  },
  canvasContainer: { overflow: "visible", zIndex: 10 },
  ring: {
    position: "absolute",
    borderWidth: 2,
    zIndex: 0,
    alignSelf: "center",
  },
  shadow: {
    height: 10,
    backgroundColor: "#6C63FF",
    borderRadius: 5,
    marginTop: -4,
    alignSelf: "center",
  },
});
