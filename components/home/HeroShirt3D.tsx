'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import styles from './HeroShirt3D.module.css';

const MODEL_SRC = '/models/useart-professional-shirt.glb';
const POSTER_SRC = '/images/useart-professional-shirt-poster.png';

type MediaState = 'ready' | 'fallback';

type NetworkInformation = {
  saveData?: boolean;
};

function disposeScene(scene: THREE.Object3D) {
  const textures = new Set<THREE.Texture>();

  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.geometry.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => {
      Object.values(material).forEach((value) => {
        if (value instanceof THREE.Texture) textures.add(value);
      });
      material.dispose();
    });
  });

  textures.forEach((texture) => texture.dispose());
}

export function HeroShirt3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<MediaState>('fallback');

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    if (connection?.saveData) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);
    camera.position.set(0, 0.03, 5.25);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x172033, 2.1));
    const key = new THREE.DirectionalLight(0xffffff, 3.2);
    key.position.set(2.8, 3.6, 4.8);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xbed0ef, 1.15);
    fill.position.set(-3.5, 1.2, 2.6);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0x5f7fb0, 1.4);
    rim.position.set(1.5, 2.2, -4.5);
    scene.add(rim);

    const pivot = new THREE.Group();
    pivot.rotation.y = -0.13;
    scene.add(pivot);

    let disposed = false;
    let modelReady = false;
    let inViewport = true;
    let frame = 0;
    let lastTime = performance.now();
    let userRotation = 0;
    let dragging = false;
    let dragStartX = 0;
    let dragStartRotation = 0;

    const renderFrame = () => renderer.render(scene, camera);

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      if (modelReady) renderFrame();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        inViewport = entry.isIntersecting;
      },
      { threshold: 0.05 },
    );
    visibilityObserver.observe(container);

    const animate = (time: number) => {
      frame = 0;
      if (!modelReady || !inViewport || document.hidden) {
        lastTime = time;
        frame = window.requestAnimationFrame(animate);
        return;
      }
      const deltaSeconds = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      if (!dragging) userRotation += deltaSeconds * 0.075;
      pivot.rotation.y = -0.13 + userRotation;
      renderFrame();
      frame = window.requestAnimationFrame(animate);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!modelReady || reducedMotionQuery.matches || event.pointerType === 'touch') return;
      dragging = true;
      dragStartX = event.clientX;
      dragStartRotation = userRotation;
      canvas.setPointerCapture(event.pointerId);
      canvas.dataset.dragging = 'true';
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      userRotation = dragStartRotation + (event.clientX - dragStartX) * 0.008;
      pivot.rotation.y = -0.13 + userRotation;
      renderFrame();
    };
    const stopDragging = (event: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      canvas.dataset.dragging = 'false';
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    };
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', stopDragging);
    canvas.addEventListener('pointercancel', stopDragging);

    const loader = new GLTFLoader();
    loader.load(
      MODEL_SRC,
      (gltf) => {
        if (disposed) {
          disposeScene(gltf.scene);
          return;
        }

        const model = gltf.scene;
        const bounds = new THREE.Box3().setFromObject(model);
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        const scale = 2.42 / Math.max(size.y, 0.001);
        model.scale.setScalar(scale);
        model.position.set(-center.x * scale, -center.y * scale - 0.02, -center.z * scale);
        model.traverse((object) => {
          if (!(object instanceof THREE.Mesh)) return;
          object.frustumCulled = true;
        });
        pivot.add(model);
        modelReady = true;
        resize();
        renderFrame();
        if (!reducedMotionQuery.matches) frame = window.requestAnimationFrame(animate);
        setState('ready');
      },
      undefined,
      () => {
        if (!disposed) setState('fallback');
      },
    );

    const onMotionPreferenceChange = () => {
      if (!modelReady) return;
      if (reducedMotionQuery.matches) {
        window.cancelAnimationFrame(frame);
        frame = 0;
        renderFrame();
        return;
      }
      if (!frame) {
        lastTime = performance.now();
        frame = window.requestAnimationFrame(animate);
      }
    };
    reducedMotionQuery.addEventListener('change', onMotionPreferenceChange);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      reducedMotionQuery.removeEventListener('change', onMotionPreferenceChange);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', stopDragging);
      canvas.removeEventListener('pointercancel', stopDragging);
      disposeScene(scene);
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.media} data-state={state}>
      <Image
        className={styles.poster}
        src={POSTER_SRC}
        alt="Camiseta branca oversized useART Vinícius Jr."
        fill
        priority
        sizes="(max-width: 880px) 100vw, 68vw"
      />
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <span className={styles.hint} aria-hidden="true">
        Arraste para girar
      </span>
    </div>
  );
}
