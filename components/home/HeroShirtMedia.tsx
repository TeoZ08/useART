'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import styles from './HeroShirtMedia.module.css';

type NetworkConnection = {
  saveData?: boolean;
  addEventListener?: (type: 'change', listener: () => void) => void;
  removeEventListener?: (type: 'change', listener: () => void) => void;
};

function allowsVideo(mediaQuery: MediaQueryList, connection?: NetworkConnection): boolean {
  return !mediaQuery.matches && connection?.saveData !== true;
}

export function HeroShirtMedia() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldRenderVideo, setShouldRenderVideo] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as Navigator & { connection?: NetworkConnection }).connection;

    const updateVideoPreference = () => {
      const enabled = allowsVideo(mediaQuery, connection);
      setShouldRenderVideo(enabled);

      if (!enabled) setVideoReady(false);
    };

    updateVideoPreference();
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updateVideoPreference);
    } else {
      mediaQuery.addListener(updateVideoPreference);
    }
    connection?.addEventListener?.('change', updateVideoPreference);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', updateVideoPreference);
      } else {
        mediaQuery.removeListener(updateVideoPreference);
      }
      connection?.removeEventListener?.('change', updateVideoPreference);
    };
  }, []);

  useEffect(() => {
    if (!shouldRenderVideo) return;

    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    let isIntersecting = true;

    const syncPlayback = () => {
      if (document.visibilityState === 'visible' && isIntersecting) {
        void video.play().catch(() => undefined);
        return;
      }

      video.pause();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting;
        syncPlayback();
      },
      { threshold: 0 },
    );
    const handleVisibilityChange = () => syncPlayback();

    observer.observe(container);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    syncPlayback();

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      video.pause();
    };
  }, [shouldRenderVideo]);

  return (
    <div
      ref={containerRef}
      className={styles.media}
      data-testid="hero-shirt-media"
      data-video-ready={videoReady || undefined}
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
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          disablePictureInPicture
          disableRemotePlayback
          aria-hidden="true"
          tabIndex={-1}
          data-testid="hero-shirt-video"
          onCanPlay={() => setVideoReady(true)}
          onError={() => setVideoReady(false)}
        >
          <source src="/videos/useart-hero-transparente.webm" type="video/webm" />
        </video>
      ) : null}
    </div>
  );
}
