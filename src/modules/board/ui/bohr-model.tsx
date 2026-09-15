import { useEffect, useRef } from "react";

export interface BohrModelProps {
  shells: number[];
  symbol: string;
  label: string;
}

const NUCLEUS_COLOR = 0xff6b4a;
const SHELL_COLORS = [0x7c4dff, 0x2f9bff, 0x1fc79a, 0xf5a524, 0xff5d8f, 0x9d7bff, 0x4ad6ff];

export function BohrModel({ shells, symbol, label }: BohrModelProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !shells.length) return undefined;

    let disposed = false;
    let frame = 0;
    let cleanup = () => {};

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    import("three")
      .then((THREE) => {
        if (disposed || !mount) return;

        const width = mount.clientWidth || 320;
        const height = mount.clientHeight || 260;

        const outerRadius = 1.5 + (shells.length - 1) * 0.62;
        const distance = outerRadius * 2.35 + 2.2;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100);
        camera.position.set(0, distance * 0.24, distance);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width, height);
        mount.appendChild(renderer.domElement);

        scene.add(new THREE.AmbientLight(0xffffff, 1.6));
        const keyLight = new THREE.PointLight(0xffffff, 60, 100);
        keyLight.position.set(6, 8, 10);
        scene.add(keyLight);

        const disposables: Array<{ dispose: () => void }> = [];

        const nucleusGeometry = new THREE.SphereGeometry(0.62, 32, 32);
        const nucleusMaterial = new THREE.MeshStandardMaterial({
          color: NUCLEUS_COLOR,
          emissive: NUCLEUS_COLOR,
          emissiveIntensity: 0.45,
          roughness: 0.35,
        });
        scene.add(new THREE.Mesh(nucleusGeometry, nucleusMaterial));
        disposables.push(nucleusGeometry, nucleusMaterial);

        const electronGeometry = new THREE.SphereGeometry(0.13, 16, 16);
        disposables.push(electronGeometry);

        const orbits: Array<{ group: InstanceType<typeof THREE.Group>; speed: number }> = [];

        shells.forEach((electrons, shellIndex) => {
          const radius = 1.5 + shellIndex * 0.62;
          const color = SHELL_COLORS[shellIndex % SHELL_COLORS.length];

          const ringGeometry = new THREE.TorusGeometry(radius, 0.012, 8, 128);
          const ringMaterial = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.4,
          });
          const ring = new THREE.Mesh(ringGeometry, ringMaterial);
          ring.rotation.x = 0.62 + shellIndex * 0.05;
          ring.rotation.y = shellIndex * (Math.PI / shells.length);
          scene.add(ring);
          disposables.push(ringGeometry, ringMaterial);

          const group = new THREE.Group();
          group.rotation.copy(ring.rotation);
          const electronMaterial = new THREE.MeshStandardMaterial({
            color,
            emissive: color,
            emissiveIntensity: 0.7,
            roughness: 0.25,
          });
          disposables.push(electronMaterial);

          for (let index = 0; index < electrons; index += 1) {
            const angle = (index / electrons) * Math.PI * 2;
            const electron = new THREE.Mesh(electronGeometry, electronMaterial);
            electron.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
            group.add(electron);
          }

          scene.add(group);
          orbits.push({ group, speed: 0.5 / (shellIndex + 1.4) });
        });

        function render(time: number) {
          if (!reduceMotion) {
            orbits.forEach((orbit) => {
              orbit.group.rotateZ(orbit.speed * 0.016);
            });
            scene.rotation.y = Math.sin(time / 6000) * 0.32;
          }
          renderer.render(scene, camera);
          frame = requestAnimationFrame(render);
        }

        frame = requestAnimationFrame(render);

        function handleResize() {
          const nextWidth = mount?.clientWidth || width;
          const nextHeight = mount?.clientHeight || height;
          camera.aspect = nextWidth / nextHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(nextWidth, nextHeight);
        }

        window.addEventListener("resize", handleResize);

        cleanup = () => {
          window.removeEventListener("resize", handleResize);
          cancelAnimationFrame(frame);
          disposables.forEach((item) => item.dispose());
          renderer.dispose();
          renderer.domElement.remove();
        };
      })
      .catch((error) => {
        void error;
      });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      cleanup();
    };
  }, [shells]);

  return (
    <div
      ref={mountRef}
      className="bohr-model"
      role="img"
      aria-label={`${symbol} — ${label}`}
      data-symbol={symbol}
    />
  );
}
