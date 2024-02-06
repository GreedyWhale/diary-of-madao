<script lang="ts">
  import * as THREE from "three";
  import GUI from "lil-gui";
  import { onMount } from "svelte";

  onMount(() => {
    const root = document.querySelector(".app")!;
    const { width } = root.getBoundingClientRect();

    const sizes = {
      width,
      height: 600,
    };

    const scene = new THREE.Scene();
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({ color: 0xff0000 }),
    );

    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
    camera.position.z = 3;

    const canvas = document.createElement("canvas");
    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(sizes.width, sizes.height);

    scene.add(mesh, camera);
    renderer.render(scene, camera);

    const tick = () => {
      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    };

    const initGUI = () => {
      const gui = new GUI({
        container: document.querySelector(".gui") as unknown as HTMLElement,
      });

      gui
        .add(camera.position, "x")
        .min(-5)
        .max(5)
        .step(0.01)
        .name("相机 X 轴位置");

      gui
        .add(camera.position, "z")
        .min(-5)
        .max(5)
        .step(0.01)
        .name("相机 Z 轴位置");

      gui
        .add(camera.position, "y")
        .min(-5)
        .max(5)
        .step(0.01)
        .name("相机 Y 轴位置");
    };

    root.appendChild(canvas);
    initGUI();
    tick();
  });
</script>

<div class="app relative">
  <div class="gui absolute right-0 top-0"></div>
</div>
