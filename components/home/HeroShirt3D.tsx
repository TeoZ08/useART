'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import styles from './HeroShirt3D.module.css';

const MODEL_SRC = '/models/useart-professional-shirt.glb';
const POSTER_SRC = '/images/useart-professional-shirt-poster.png';

type MediaState = 'ready' | 'fallback';
type GarmentSide = 'front' | 'back';

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
  const viewButtonRef = useRef<HTMLButtonElement>(null);
  const [state, setState] = useState<MediaState>('fallback');
  const [side, setSide] = useState<GarmentSide>('front');

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const viewButton = viewButtonRef.current;
    if (!container || !canvas || !viewButton) return;

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    if (connection?.saveData || reducedMotionQuery.matches) return;

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
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);
    camera.position.set(0, 0.03, 5.25);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x172033, 1.35));
    const key = new THREE.DirectionalLight(0xffffff, 2.65);
    key.position.set(2.8, 3.6, 4.8);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xbed0ef, 0.8);
    fill.position.set(-3.5, 1.2, 2.6);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0x5f7fb0, 1.05);
    rim.position.set(1.5, 2.2, -4.5);
    scene.add(rim);

    const pivot = new THREE.Group();
    pivot.rotation.y = -0.13;
    scene.add(pivot);

    let disposed = false;
    let modelReady = false;
    let inViewport = true;
    let lastTime = performance.now();
    let userRotation = 0;
    let targetRotation = 0;
    let currentSide: GarmentSide = 'front';
    let turningToSide = false;
    let dragging = false;
    let dragStartX = 0;
    let dragStartRotation = 0;

    const renderFrame = () => renderer.render(scene, camera);

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;

      const pixelRatio = Math.min(window.devicePixelRatio || 1, width < 700 ? 1.2 : 1.5);
      let drawingWidth = Math.floor(width * pixelRatio);
      let drawingHeight = Math.floor(height * pixelRatio);
      const maxPixelCount = 1_800_000;
      const pixelCount = drawingWidth * drawingHeight;
      if (pixelCount > maxPixelCount) {
        const renderScale = Math.sqrt(maxPixelCount / pixelCount);
        drawingWidth = Math.floor(drawingWidth * renderScale);
        drawingHeight = Math.floor(drawingHeight * renderScale);
      }

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      if (canvas.width !== drawingWidth || canvas.height !== drawingHeight) {
        renderer.setSize(drawingWidth, drawingHeight, false);
      }
      if (modelReady) renderFrame();
    };

    const syncAnimation = () => {
      const shouldAnimate =
        modelReady && inViewport && !document.hidden && !reducedMotionQuery.matches;
      renderer.setAnimationLoop(shouldAnimate ? animate : null);
      if (!shouldAnimate && modelReady) renderFrame();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        inViewport = entry.isIntersecting;
        syncAnimation();
      },
      { threshold: 0.05 },
    );
    visibilityObserver.observe(container);

    function animate(time: number) {
      const deltaSeconds = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      if (turningToSide && !dragging) {
        const difference = Math.atan2(
          Math.sin(targetRotation - userRotation),
          Math.cos(targetRotation - userRotation),
        );
        userRotation += difference * Math.min(1, deltaSeconds * 6.5);
        if (Math.abs(difference) < 0.002) {
          userRotation = targetRotation;
          turningToSide = false;
        }
      }

      const idleSway = !dragging && !turningToSide ? Math.sin(time * 0.00055) * 0.04 : 0;
      pivot.rotation.y = -0.13 + userRotation + idleSway;
      renderFrame();
    }

    const onToggleView = () => {
      currentSide = currentSide === 'front' ? 'back' : 'front';
      targetRotation = currentSide === 'back' ? Math.PI : 0;
      setSide(currentSide);
      if (reducedMotionQuery.matches) {
        userRotation = targetRotation;
        turningToSide = false;
        pivot.rotation.y = -0.13 + userRotation;
        if (modelReady) renderFrame();
        return;
      }
      turningToSide = true;
      lastTime = performance.now();
      syncAnimation();
    };
    viewButton.addEventListener('click', onToggleView);

    const onPointerDown = (event: PointerEvent) => {
      if (!modelReady || reducedMotionQuery.matches) return;
      dragging = true;
      turningToSide = false;
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
      const normalizedRotation = ((userRotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      currentSide =
        normalizedRotation > Math.PI * 0.5 && normalizedRotation < Math.PI * 1.5 ? 'back' : 'front';
      setSide(currentSide);
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
        const scale = 2.2 / Math.max(size.y, 0.001);
        model.scale.setScalar(scale);
        model.position.set(-center.x * scale, -center.y * scale - 0.01, -center.z * scale);
        model.traverse((object) => {
          if (!(object instanceof THREE.Mesh)) return;
          object.frustumCulled = true;
        });
        pivot.add(model);
        modelReady = true;
        resize();
        renderFrame();
        syncAnimation();
        setState('ready');
      },
      undefined,
      () => {
        if (!disposed) {
          renderer.setAnimationLoop(null);
          setState('fallback');
        }
      },
    );

    const onMotionPreferenceChange = () => syncAnimation();
    const onVisibilityChange = () => syncAnimation();
    reducedMotionQuery.addEventListener('change', onMotionPreferenceChange);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      disposed = true;
      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      reducedMotionQuery.removeEventListener('change', onMotionPreferenceChange);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      viewButton.removeEventListener('click', onToggleView);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', stopDragging);
      canvas.removeEventListener('pointercancel', stopDragging);
      disposeScene(scene);
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.media} data-state={state} data-testid="hero-shirt-3d">
      <Image
        className={styles.poster}
        src={POSTER_SRC}
        alt="Camiseta branca oversized useART Vinícius Jr."
        fill
        priority
        sizes="(max-width: 880px) 100vw, 68vw"
        data-testid="hero-shirt-3d-poster"
      />
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        aria-hidden="true"
        data-testid="hero-shirt-3d-canvas"
      />
      <div className={styles.controls}>
        <button
          ref={viewButtonRef}
          className={styles.viewButton}
          type="button"
          aria-pressed={side === 'back'}
        >
          {side === 'front' ? 'Ver costas' : 'Ver frente'}
        </button>
        <span className={styles.hintDesktop} aria-hidden="true">
          Arraste para explorar
        </span>
        <span className={styles.hintTouch} aria-hidden="true">
          Deslize para girar
        </span>
      </div>
    </div>
  );
}
