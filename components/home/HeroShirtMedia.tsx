'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import {
  canUseInteractiveHeroVideo,
  getMirroredMediaTime,
  HERO_ANIMATION_START_TIME,
  HERO_TRANSITION_TIMEOUT_MS,
  INTERACTIVE_HERO_STATES,
  type HeroMediaState,
  type HeroVisibleMedia,
} from './heroAnimationMachine';
import styles from './HeroShirtMedia.module.css';

type NetworkConnection = {
  saveData?: boolean;
  addEventListener?: (type: 'change', listener: () => void) => void;
  removeEventListener?: (type: 'change', listener: () => void) => void;
};

type SeekResult = 'ready' | 'stale' | 'failed';

const FORWARD_VIDEO_SRC = '/videos/useart-hero-transparente.webm';
const REVERSE_VIDEO_SRC = '/videos/useart-hero-transparente-reverse.webm';

function mediaDuration(forward: HTMLVideoElement, reverse?: HTMLVideoElement | null): number {
  const candidateDurations = [forward.duration];
  if (reverse) candidateDurations.push(reverse.duration);
  const durations = candidateDurations.filter(
    (duration) => Number.isFinite(duration) && duration > 0,
  );
  return durations.length > 0 ? Math.min(...durations) : 0;
}

function canReadMetadata(video: HTMLVideoElement): boolean {
  return video.readyState >= HTMLMediaElement.HAVE_METADATA;
}

export function HeroShirtMedia() {
  const containerRef = useRef<HTMLDivElement>(null);
  const forwardVideoRef = useRef<HTMLVideoElement>(null);
  const reverseVideoRef = useRef<HTMLVideoElement>(null);
  const transitionRef = useRef(0);
  const stateRef = useRef<HeroMediaState>('fallback');
  const visibleMediaRef = useRef<HeroVisibleMedia>('poster');
  const wantsMotionRef = useRef(false);
  const interactiveRef = useRef(false);
  const reverseFailedRef = useRef(false);
  const pendingForwardTimeRef = useRef(HERO_ANIMATION_START_TIME);

  const [state, setState] = useState<HeroMediaState>('fallback');
  const [visibleMedia, setVisibleMediaState] = useState<HeroVisibleMedia>('poster');
  const [reversePreload, setReversePreload] = useState<'metadata' | 'auto'>('metadata');
  const shouldRenderVideo = INTERACTIVE_HERO_STATES.has(state);

  const setMediaState = useCallback((nextState: HeroMediaState) => {
    stateRef.current = nextState;
    setState(nextState);
  }, []);

  const setVisibleMedia = useCallback((nextMedia: HeroVisibleMedia) => {
    visibleMediaRef.current = nextMedia;
    setVisibleMediaState(nextMedia);
  }, []);

  const nextTransition = useCallback(() => {
    transitionRef.current += 1;
    return transitionRef.current;
  }, []);

  const isCurrentTransition = useCallback((token: number) => transitionRef.current === token, []);

  const requestReversePreload = useCallback(() => {
    setReversePreload('auto');
    const reverse = reverseVideoRef.current;
    if (reverse && reverse.preload !== 'auto') {
      reverse.preload = 'auto';
      reverse.load();
    }
  }, []);

  const waitForMetadata = useCallback(
    async (video: HTMLVideoElement, token: number, timeout = HERO_TRANSITION_TIMEOUT_MS) => {
      if (canReadMetadata(video)) return isCurrentTransition(token);

      return new Promise<boolean>((resolve) => {
        let done = false;
        const cleanup = () => {
          window.clearTimeout(timeoutId);
          video.removeEventListener('loadedmetadata', handleReady);
          video.removeEventListener('error', handleError);
        };
        const finish = (result: boolean) => {
          if (done) return;
          done = true;
          cleanup();
          resolve(result && isCurrentTransition(token));
        };
        const handleReady = () => finish(true);
        const handleError = () => finish(false);
        const timeoutId = window.setTimeout(() => finish(false), timeout);

        video.addEventListener('loadedmetadata', handleReady);
        video.addEventListener('error', handleError);
      });
    },
    [isCurrentTransition],
  );

  const seekVideo = useCallback(
    async (
      video: HTMLVideoElement,
      targetTime: number,
      token: number,
      timeout = HERO_TRANSITION_TIMEOUT_MS,
    ): Promise<SeekResult> => {
      const hasMetadata = await waitForMetadata(video, token, timeout);
      if (!hasMetadata) return isCurrentTransition(token) ? 'failed' : 'stale';
      if (!isCurrentTransition(token)) return 'stale';

      const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
      const nextTime = Math.min(Math.max(targetTime, 0), duration || targetTime);
      if (Math.abs(video.currentTime - nextTime) <= 0.015 && !video.seeking) return 'ready';

      return new Promise<SeekResult>((resolve) => {
        let done = false;
        const cleanup = () => {
          window.clearTimeout(timeoutId);
          video.removeEventListener('seeked', handleSeeked);
          video.removeEventListener('error', handleError);
        };
        const finish = (result: SeekResult) => {
          if (done) return;
          done = true;
          cleanup();
          resolve(isCurrentTransition(token) ? result : 'stale');
        };
        const handleSeeked = () => finish('ready');
        const handleError = () => finish('failed');
        const timeoutId = window.setTimeout(() => finish('failed'), timeout);

        video.addEventListener('seeked', handleSeeked);
        video.addEventListener('error', handleError);

        try {
          video.currentTime = nextTime;
        } catch {
          finish('failed');
        }
      });
    },
    [isCurrentTransition, waitForMetadata],
  );

  const pauseVideos = useCallback(() => {
    const forward = forwardVideoRef.current;
    const reverse = reverseVideoRef.current;
    forward?.pause();
    reverse?.pause();
    if (forward) forward.loop = false;
    if (reverse) reverse.loop = false;
  }, []);

  const enterStaticError = useCallback(() => {
    nextTransition();
    wantsMotionRef.current = false;
    pauseVideos();
    setVisibleMedia('poster');
    setMediaState('error');
  }, [nextTransition, pauseVideos, setMediaState, setVisibleMedia]);

  const prepareInteractiveIdle = useCallback(async () => {
    const forward = forwardVideoRef.current;
    if (!interactiveRef.current || !forward || stateRef.current === 'error') return;

    const token = nextTransition();
    wantsMotionRef.current = false;
    pauseVideos();
    setMediaState('loading');
    setVisibleMedia('poster');

    const seekResult = await seekVideo(forward, HERO_ANIMATION_START_TIME, token);
    if (seekResult === 'stale') return;
    if (seekResult === 'failed') {
      enterStaticError();
      return;
    }

    if (!isCurrentTransition(token)) return;
    setVisibleMedia('forward');
    setMediaState('idle');
    requestReversePreload();
  }, [
    enterStaticError,
    isCurrentTransition,
    nextTransition,
    pauseVideos,
    requestReversePreload,
    seekVideo,
    setMediaState,
    setVisibleMedia,
  ]);

  const resetToIdle = useCallback(async () => {
    const forward = forwardVideoRef.current;
    const reverse = reverseVideoRef.current;
    const token = nextTransition();
    wantsMotionRef.current = false;
    pendingForwardTimeRef.current = HERO_ANIMATION_START_TIME;
    pauseVideos();

    if (!interactiveRef.current || !forward) {
      setVisibleMedia('poster');
      setMediaState('fallback');
      return;
    }

    const seekResult = await seekVideo(forward, HERO_ANIMATION_START_TIME, token);
    if (seekResult !== 'ready' || !isCurrentTransition(token)) return;

    setVisibleMedia('forward');
    setMediaState('idle');

    if (reverse && canReadMetadata(reverse) && !reverseFailedRef.current) {
      try {
        reverse.currentTime = HERO_ANIMATION_START_TIME;
      } catch {
        reverseFailedRef.current = true;
      }
    }
  }, [isCurrentTransition, nextTransition, pauseVideos, seekVideo, setMediaState, setVisibleMedia]);

  const fallbackToInitialFrame = useCallback(
    async (token: number) => {
      const forward = forwardVideoRef.current;
      pauseVideos();
      setVisibleMedia('poster');

      if (!forward) {
        setMediaState('fallback');
        return;
      }

      const seekResult = await seekVideo(forward, HERO_ANIMATION_START_TIME, token, 900);
      if (seekResult === 'stale' || !isCurrentTransition(token)) return;

      setMediaState(seekResult === 'ready' ? 'idle' : 'fallback');
      if (seekResult === 'ready') setVisibleMedia('forward');
    },
    [isCurrentTransition, pauseVideos, seekVideo, setMediaState, setVisibleMedia],
  );

  const startReverseFromForwardTime = useCallback(
    async (forwardTime: number) => {
      const forward = forwardVideoRef.current;
      const reverse = reverseVideoRef.current;
      if (!interactiveRef.current || !forward) return;

      const token = nextTransition();
      pauseVideos();
      requestReversePreload();
      setMediaState('seeking-reverse');

      if (!reverse || reverseFailedRef.current) {
        await fallbackToInitialFrame(token);
        return;
      }

      const duration = mediaDuration(forward, reverse);
      const clampedForwardTime = Math.min(Math.max(forwardTime, 0), duration || forwardTime);
      pendingForwardTimeRef.current = clampedForwardTime;
      const reverseTime = getMirroredMediaTime(duration, clampedForwardTime);
      const seekResult = await seekVideo(reverse, reverseTime, token);

      if (seekResult === 'stale') return;
      if (seekResult === 'failed') {
        reverseFailedRef.current = true;
        await fallbackToInitialFrame(token);
        return;
      }
      if (!isCurrentTransition(token)) return;

      if (wantsMotionRef.current) return;

      setVisibleMedia('reverse');
      setMediaState('reverse');

      reverse.loop = false;
      try {
        await reverse.play();
      } catch (error) {
        if (!isCurrentTransition(token)) return;
        if (error instanceof DOMException && error.name === 'AbortError') return;
        reverseFailedRef.current = true;
        await fallbackToInitialFrame(token);
      }
    },
    [
      fallbackToInitialFrame,
      isCurrentTransition,
      nextTransition,
      pauseVideos,
      requestReversePreload,
      seekVideo,
      setMediaState,
      setVisibleMedia,
    ],
  );

  const playForwardFromTime = useCallback(
    async (forwardTime: number, reverseInterrupted: boolean) => {
      const forward = forwardVideoRef.current;
      if (!interactiveRef.current || !forward || stateRef.current === 'loading') return;

      const token = nextTransition();
      pauseVideos();
      requestReversePreload();
      setMediaState('seeking-forward');

      const seekResult = await seekVideo(forward, forwardTime, token);
      if (seekResult === 'stale') return;
      if (seekResult === 'failed') {
        enterStaticError();
        return;
      }
      if (!isCurrentTransition(token)) return;

      if (!wantsMotionRef.current) {
        if (reverseInterrupted && forwardTime > HERO_ANIMATION_START_TIME + 0.04) {
          await startReverseFromForwardTime(forwardTime);
          return;
        }

        setVisibleMedia('forward');
        setMediaState('idle');
        return;
      }

      setVisibleMedia('forward');
      setMediaState('forward');
      forward.loop = false;

      try {
        await forward.play();
      } catch (error) {
        if (!isCurrentTransition(token)) return;
        if (error instanceof DOMException && error.name === 'AbortError') return;
        enterStaticError();
      }
    },
    [
      enterStaticError,
      isCurrentTransition,
      nextTransition,
      pauseVideos,
      requestReversePreload,
      seekVideo,
      setMediaState,
      setVisibleMedia,
      startReverseFromForwardTime,
    ],
  );

  const finishReverseToIdle = useCallback(async () => {
    const forward = forwardVideoRef.current;
    if (!forward) {
      setVisibleMedia('poster');
      setMediaState('fallback');
      return;
    }

    const token = nextTransition();
    wantsMotionRef.current = false;
    pauseVideos();
    setMediaState('seeking-forward');

    const seekResult = await seekVideo(forward, HERO_ANIMATION_START_TIME, token);
    if (seekResult !== 'ready' || !isCurrentTransition(token)) return;

    setVisibleMedia('forward');
    setMediaState('idle');
    if (wantsMotionRef.current) void playForwardFromTime(HERO_ANIMATION_START_TIME, false);
  }, [
    isCurrentTransition,
    nextTransition,
    pauseVideos,
    playForwardFromTime,
    seekVideo,
    setMediaState,
    setVisibleMedia,
  ]);

  const handlePointerEnter = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (event.pointerType !== 'mouse' || !interactiveRef.current) return;

      wantsMotionRef.current = true;
      const forward = forwardVideoRef.current;
      const reverse = reverseVideoRef.current;
      const currentState = stateRef.current;
      if (!forward || currentState === 'loading' || currentState === 'error') return;

      if (currentState === 'idle') {
        void playForwardFromTime(HERO_ANIMATION_START_TIME, false);
        return;
      }

      if (currentState === 'reverse' && reverse) {
        reverse.pause();
        const duration = mediaDuration(forward, reverse);
        const forwardTime = getMirroredMediaTime(duration, reverse.currentTime);
        void playForwardFromTime(forwardTime, true);
        return;
      }

      if (currentState === 'seeking-reverse') {
        void playForwardFromTime(pendingForwardTimeRef.current, true);
      }
    },
    [playForwardFromTime],
  );

  const handlePointerLeave = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (event.pointerType !== 'mouse' || !interactiveRef.current) return;

      wantsMotionRef.current = false;
      const forward = forwardVideoRef.current;
      const currentState = stateRef.current;
      if (!forward) return;

      if (currentState === 'forward') {
        void startReverseFromForwardTime(forward.currentTime);
        return;
      }

      if (currentState === 'holding-end') {
        const reverse = reverseVideoRef.current;
        void startReverseFromForwardTime(mediaDuration(forward, reverse));
      }
    },
    [startReverseFromForwardTime],
  );

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const hoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)');
    const connection = (navigator as Navigator & { connection?: NetworkConnection }).connection;

    const updateVideoMode = () => {
      const canUseVideo = canUseInteractiveHeroVideo({
        reducedMotion: reducedMotion.matches,
        hoverCapable: hoverCapable.matches,
        saveData: connection?.saveData,
      });

      interactiveRef.current = canUseVideo;
      if (canUseVideo) {
        if (!INTERACTIVE_HERO_STATES.has(stateRef.current)) {
          setReversePreload('metadata');
          setVisibleMedia('poster');
          setMediaState('loading');
        }
        return;
      }

      nextTransition();
      wantsMotionRef.current = false;
      pauseVideos();
      setVisibleMedia('poster');
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
      nextTransition();
      for (const mediaQuery of subscriptions) {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', updateVideoMode);
        } else {
          mediaQuery.removeListener(updateVideoMode);
        }
      }
      connection?.removeEventListener?.('change', updateVideoMode);
    };
  }, [nextTransition, pauseVideos, setMediaState, setVisibleMedia]);

  useEffect(() => {
    if (!shouldRenderVideo) return;

    const container = containerRef.current;
    if (!container) return;

    const resetWhenInactive = () => {
      if (document.visibilityState !== 'visible') void resetToIdle();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) void resetToIdle();
      },
      { threshold: 0 },
    );

    observer.observe(container);
    document.addEventListener('visibilitychange', resetWhenInactive);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', resetWhenInactive);
    };
  }, [resetToIdle, shouldRenderVideo]);

  return (
    <div
      ref={containerRef}
      className={styles.media}
      data-testid="hero-shirt-media"
      data-state={state}
      data-visible-media={visibleMedia}
    >
      <Image
        src="/images/useart-hero-poster.webp"
        width={1920}
        height={1080}
        alt=""
        aria-hidden="true"
        className={styles.poster}
        priority
        sizes="(max-width: 640px) 150vw, 68vw"
        data-testid="hero-shirt-poster"
      />
      {shouldRenderVideo ? (
        <>
          <video
            ref={forwardVideoRef}
            className={styles.forwardVideo}
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            aria-hidden="true"
            tabIndex={-1}
            data-testid="hero-shirt-video"
            onLoadedMetadata={() => {
              if (stateRef.current === 'loading') void prepareInteractiveIdle();
            }}
            onCanPlay={() => {
              if (stateRef.current === 'loading') void prepareInteractiveIdle();
            }}
            onEnded={() => {
              if (stateRef.current !== 'forward') return;

              const forward = forwardVideoRef.current;
              forward?.pause();
              if (!wantsMotionRef.current && forward) {
                void startReverseFromForwardTime(forward.currentTime || forward.duration);
                return;
              }

              setVisibleMedia('forward');
              setMediaState('holding-end');
            }}
            onError={() => {
              if (forwardVideoRef.current?.error) enterStaticError();
            }}
          >
            <source src={FORWARD_VIDEO_SRC} type="video/webm" onError={enterStaticError} />
          </video>
          <video
            ref={reverseVideoRef}
            className={styles.reverseVideo}
            muted
            playsInline
            preload={reversePreload}
            disablePictureInPicture
            disableRemotePlayback
            aria-hidden="true"
            tabIndex={-1}
            data-testid="hero-shirt-video-reverse"
            onError={() => {
              reverseFailedRef.current = true;
            }}
            onEnded={() => {
              if (stateRef.current === 'reverse') void finishReverseToIdle();
            }}
          >
            <source
              src={REVERSE_VIDEO_SRC}
              type="video/webm"
              onError={() => {
                reverseFailedRef.current = true;
              }}
            />
          </video>
          <div
            className={styles.hoverZone}
            data-testid="hero-shirt-hover-zone"
            aria-hidden="true"
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
          />
        </>
      ) : null}
    </div>
  );
}
