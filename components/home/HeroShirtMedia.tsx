'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './HeroShirtMedia.module.css';

type HeroMediaState = 'fallback' | 'loading' | 'ready' | 'playing' | 'rewinding' | 'error';

type NetworkConnection = {
  saveData?: boolean;
  addEventListener?: (type: 'change', listener: () => void) => void;
  removeEventListener?: (type: 'change', listener: () => void) => void;
};

const VIDEO_STATES = new Set<HeroMediaState>(['loading', 'ready', 'playing', 'rewinding']);

function canUseInteractiveVideo(
  reducedMotion: MediaQueryList,
  hoverCapable: MediaQueryList,
  connection?: NetworkConnection,
): boolean {
  return !reducedMotion.matches && hoverCapable.matches && connection?.saveData !== true;
}

function rewindDuration(currentTime: number, duration: number): number {
  const progress = duration > 0 ? currentTime / duration : 0;
  return Math.round(Math.min(1_800, Math.max(900, 850 + progress * 950)));
}

export function HeroShirtMedia() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rewindFrameRef = useRef<number | null>(null);
  const stateRef = useRef<HeroMediaState>('fallback');
  const [state, setState] = useState<HeroMediaState>('fallback');
  const shouldRenderVideo = VIDEO_STATES.has(state);

  const setMediaState = useCallback((nextState: HeroMediaState) => {
    stateRef.current = nextState;
    setState(nextState);
  }, []);

  const cancelRewind = useCallback(() => {
    if (rewindFrameRef.current !== null) {
      window.cancelAnimationFrame(rewindFrameRef.current);
      rewindFrameRef.current = null;
    }
  }, []);

  const resetToReady = useCallback(() => {
    cancelRewind();

    const video = videoRef.current;
    if (!video) return;

    video.loop = false;
    video.pause();

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      video.currentTime = 0;
      setMediaState('ready');
      return;
    }

    setMediaState('loading');
  }, [cancelRewind, setMediaState]);

  const rewindToStart = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    cancelRewind();
    video.loop = false;
    video.pause();

    const startTime = video.currentTime;
    if (!Number.isFinite(startTime) || startTime <= 0.04) {
      resetToReady();
      return;
    }

    setMediaState('rewinding');
    const startedAt = performance.now();
    const duration = rewindDuration(startTime, video.duration);
    let lastSeekAt = 0;

    const step = (now: number) => {
      if (stateRef.current !== 'rewinding') return;

      const progress = Math.min(1, (now - startedAt) / duration);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const nextTime = Math.max(0, startTime * (1 - easedProgress));

      if (now - lastSeekAt >= 48 || progress === 1) {
        video.currentTime = nextTime;
        lastSeekAt = now;
      }

      if (progress === 1) {
        video.currentTime = 0;
        rewindFrameRef.current = null;
        setMediaState('ready');
        return;
      }

      rewindFrameRef.current = window.requestAnimationFrame(step);
    };

    rewindFrameRef.current = window.requestAnimationFrame(step);
  }, [cancelRewind, resetToReady, setMediaState]);

  const playFromCurrentFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video || stateRef.current === 'loading' || stateRef.current === 'error') return;

    cancelRewind();
    video.loop = true;
    setMediaState('playing');
    void video.play().catch(() => {
      if (stateRef.current !== 'playing') return;
      video.loop = false;
      setMediaState(video.error ? 'error' : 'ready');
    });
  }, [cancelRewind, setMediaState]);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const hoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)');
    const connection = (navigator as Navigator & { connection?: NetworkConnection }).connection;

    const updateVideoMode = () => {
      if (canUseInteractiveVideo(reducedMotion, hoverCapable, connection)) {
        if (!VIDEO_STATES.has(stateRef.current)) setMediaState('loading');
        return;
      }

      cancelRewind();
      const video = videoRef.current;
      video?.pause();
      if (video && video.readyState >= HTMLMediaElement.HAVE_METADATA) video.currentTime = 0;
      setMediaState('fallback');
    };

    updateVideoMode();
    const subscriptions = [reducedMotion, hoverCapable];
    for (const mediaQuery of subscriptions) {
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', updateVideoMode);
      } else {
        mediaQuery.addListener(updateVideoMode);
      }
    }
    connection?.addEventListener?.('change', updateVideoMode);

    return () => {
      cancelRewind();
      for (const mediaQuery of subscriptions) {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', updateVideoMode);
        } else {
          mediaQuery.removeListener(updateVideoMode);
        }
      }
      connection?.removeEventListener?.('change', updateVideoMode);
    };
  }, [cancelRewind, setMediaState]);

  useEffect(() => {
    if (!shouldRenderVideo) return;

    const container = containerRef.current;
    if (!container) return;

    const resetWhenInactive = () => {
      if (document.visibilityState !== 'visible') resetToReady();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) resetToReady();
      },
      { threshold: 0 },
    );

    observer.observe(container);
    document.addEventListener('visibilitychange', resetWhenInactive);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', resetWhenInactive);
    };
  }, [resetToReady, shouldRenderVideo]);

  return (
    <div
      ref={containerRef}
      className={styles.media}
      data-testid="hero-shirt-media"
      data-state={state}
    >
      <Image
        src="/images/useart-hero-poster.webp"
        width={1600}
        height={900}
        alt=""
        aria-hidden="true"
        className={styles.poster}
        priority
        sizes="(max-width: 640px) 150vw, 68vw"
        data-testid="hero-shirt-poster"
      />
      {shouldRenderVideo ? (
        <video
          ref={videoRef}
          className={styles.video}
          muted
          loop={state === 'playing'}
          playsInline
          preload="metadata"
          disablePictureInPicture
          disableRemotePlayback
          aria-hidden="true"
          tabIndex={-1}
          data-testid="hero-shirt-video"
          onLoadedMetadata={resetToReady}
          onCanPlay={() => {
            if (stateRef.current === 'loading') resetToReady();
          }}
          onError={() => {
            if (!videoRef.current?.error) return;
            cancelRewind();
            setMediaState('error');
          }}
        >
          <source src="/videos/useart-hero-transparente.webm" type="video/webm" />
        </video>
      ) : null}
      {shouldRenderVideo ? (
        <div
          className={styles.hoverZone}
          data-testid="hero-shirt-hover-zone"
          aria-hidden="true"
          onPointerEnter={(event) => {
            if (event.pointerType === 'mouse') playFromCurrentFrame();
          }}
          onPointerLeave={(event) => {
            if (event.pointerType === 'mouse') rewindToStart();
          }}
        />
      ) : null}
    </div>
  );
}
