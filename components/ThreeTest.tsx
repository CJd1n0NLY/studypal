import { Asset } from "expo-asset";
import { ExpoWebGLRenderingContext, GLView } from "expo-gl";
import { Renderer, loadAsync } from "expo-three";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as THREE from "three";

export function ThreeTest() {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onContextCreate = async (gl: ExpoWebGLRenderingContext) => {
    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      1000,
    );
    camera.position.z = 5;
    camera.position.y = 1;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    try {
      let gltf;
      if (Platform.OS === "web") {
        gltf = await loadAsync("/sparky.glb");
      } else {
        const asset = Asset.fromModule(require("../assets/models/sparky.glb"));
        await asset.downloadAsync();
        gltf = await loadAsync(asset);
      }

      const model = gltf.scene || gltf;
      model.position.y = -2;
      scene.add(model);

      // --- NEW ANIMATION LOGIC ---

      // 1. Log the names of all available animations
      const animNames = gltf.animations.map((a: THREE.AnimationClip) => a.name);
      console.log("Found Animations:", animNames);

      // 2. Setup the Animation Mixer
      const mixer = new THREE.AnimationMixer(model);

      // 3. Play the first animation if it exists
      if (gltf.animations.length > 0) {
        const action = mixer.clipAction(gltf.animations[0]);
        action.play();
      }

      // We need a clock to tell the mixer how much time has passed each frame
      const clock = new THREE.Clock();

      const animate = () => {
        timeoutRef.current = setTimeout(animate, 1000 / 60);

        // Update the mixer with the time difference
        const delta = clock.getDelta();
        mixer.update(delta);

        renderer.render(scene, camera);
        gl.endFrameEXP();
      };
      animate();
    } catch (error) {
      console.error("Error loading Sparky:", error);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <GLView
      style={{ width: 200, height: 200 }}
      onContextCreate={onContextCreate}
    />
  );
}
