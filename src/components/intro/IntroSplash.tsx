import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useIntroSeen } from "./useIntroSeen";

export function IntroSplash() {
  const { showIntro, markIntroSeen, dismissIntro } = useIntroSeen();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [useStaticFallback, setUseStaticFallback] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioFadeIntervalRef = useRef<number | null>(null);
  const safetyTimeoutRef = useRef<number | null>(null);
  const idlePrefetchRef = useRef<number | null>(null);

  // Background idle route prefetching during playback
  useEffect(() => {
    if (!showIntro) return;

    const prefetchRoutes = () => {
      try {
        import("@/pages/UserDashboardPage");
        import("@/pages/LandingPage");
        import("@/pages/LoginPage");
      } catch {
        // Silently ignore prefetch issues
      }
    };

    const win = window as unknown as {
      requestIdleCallback?: (cb: () => void) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (typeof win.requestIdleCallback === "function") {
      idlePrefetchRef.current = win.requestIdleCallback(prefetchRoutes);
    } else {
      idlePrefetchRef.current = window.setTimeout(prefetchRoutes, 400);
    }

    return () => {
      if (idlePrefetchRef.current) {
        if (typeof win.cancelIdleCallback === "function") {
          win.cancelIdleCallback(idlePrefetchRef.current);
        } else {
          clearTimeout(idlePrefetchRef.current);
        }
      }
    };
  }, [showIntro]);

  // Lock body scroll, isolate accessibility focus, and mark intro as seen when mounted
  useEffect(() => {
    if (!showIntro) return;

    markIntroSeen();
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Set dataset attribute for CSS transitions
    document.documentElement.dataset.introActive = "true";

    const appContainer = document.getElementById("app-root-container");
    if (appContainer) {
      appContainer.setAttribute("aria-hidden", "true");
      appContainer.setAttribute("inert", "");
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      delete document.documentElement.dataset.introActive;
      if (appContainer) {
        appContainer.removeAttribute("aria-hidden");
        appContainer.removeAttribute("inert");
      }
    };
  }, [showIntro, markIntroSeen]);

  // Smooth transition from intro directly into the dashboard
  const handleExit = useCallback(async () => {
    if (isExiting) return;
    setIsExiting(true);

    // If user is not yet signed in, take them to the login screen for both user and admin access
    if (!user) {
      navigate("/login", { replace: true });
    } else {
      navigate(profile?.role === "admin" ? "/admin" : "/dashboard", { replace: true });
    }

    // Remove introActive and inert immediately so underlying dashboard smoothly scales and fades up
    delete document.documentElement.dataset.introActive;
    const appContainer = document.getElementById("app-root-container");
    if (appContainer) {
      appContainer.removeAttribute("aria-hidden");
      appContainer.removeAttribute("inert");
    }

    // Fade out audio over 400ms smoothly
    const video = videoRef.current;
    if (video && !video.muted && video.volume > 0.05) {
      const stepTime = 30;
      const stepVolume = video.volume / (400 / stepTime);
      audioFadeIntervalRef.current = window.setInterval(() => {
        if (video.volume > stepVolume) {
          video.volume = Math.max(0, video.volume - stepVolume);
        } else {
          video.volume = 0;
          if (audioFadeIntervalRef.current) clearInterval(audioFadeIntervalRef.current);
        }
      }, stepTime);
    }

    // Give 900ms for Framer Motion exit crossfade to complete seamlessly
    window.setTimeout(() => {
      dismissIntro();
    }, 920);
  }, [isExiting, user, profile, navigate, dismissIntro]);

  // Global unmuting helper to guarantee full unmuted audio playback
  const forceUnmute = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = false;
      video.volume = 1.0;
      setIsMuted(false);
    }
  }, []);

  // Ensure audio always unmutes on any user interaction anywhere on the screen
  useEffect(() => {
    if (!showIntro) return;

    window.addEventListener("pointerdown", forceUnmute, { once: true });
    window.addEventListener("keydown", forceUnmute, { once: true });
    window.addEventListener("touchstart", forceUnmute, { once: true });

    return () => {
      window.removeEventListener("pointerdown", forceUnmute);
      window.removeEventListener("keydown", forceUnmute);
      window.removeEventListener("touchstart", forceUnmute);
    };
  }, [showIntro, forceUnmute]);

  // Handle data-saver or static fallback timer
  useEffect(() => {
    if (!showIntro) return;

    // Check Data Saver mode
    const nav = navigator as unknown as { connection?: { saveData?: boolean } };
    if (nav.connection?.saveData) {
      setUseStaticFallback(true);
      const timer = window.setTimeout(handleExit, 2400);
      return () => clearTimeout(timer);
    }

    // Safety timeout: dismiss intro after 12s no matter what
    safetyTimeoutRef.current = window.setTimeout(() => {
      handleExit();
    }, 12000);

    // 3.0s readiness timeout for slow networks
    const readinessTimeout = window.setTimeout(() => {
      if (!isVideoReady && !isExiting) {
        setUseStaticFallback(true);
        window.setTimeout(handleExit, 2000);
      }
    }, 3200);

    return () => {
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
      clearTimeout(readinessTimeout);
      if (audioFadeIntervalRef.current) clearInterval(audioFadeIntervalRef.current);
    };
  }, [showIntro, isVideoReady, isExiting, handleExit]);

  // Setup video playback, always attempt unmuted audio, and handle tab visibility
  useEffect(() => {
    if (!showIntro || useStaticFallback) return;

    const video = videoRef.current;
    if (!video) return;

    // Always attempt unmuted playback with full volume
    const startPlayback = async () => {
      try {
        video.muted = false;
        video.volume = 1.0;
        await video.play();
        setIsMuted(false);
      } catch (err: unknown) {
        // If browser autoplay policy blocks unmuted autoplay before interaction,
        // start playing immediately and unmute upon first interaction
        if (err instanceof Error && (err.name === "NotAllowedError" || err.name === "AbortError")) {
          try {
            video.muted = true;
            await video.play();
            setIsMuted(true);
            const handleFirstGesture = () => {
              video.muted = false;
              video.volume = 1.0;
              setIsMuted(false);
            };
            window.addEventListener("pointerdown", handleFirstGesture, { once: true });
            window.addEventListener("keydown", handleFirstGesture, { once: true });
            window.addEventListener("touchstart", handleFirstGesture, { once: true });
          } catch {
            setUseStaticFallback(true);
            window.setTimeout(handleExit, 2200);
          }
        }
      }
    };

    const handleCanPlay = () => {
      setIsVideoReady(true);
      startPlayback();
    };

    const handleTimeUpdate = () => {
      // Meaningful content ends around 7.8s; smooth transition out
      if (video.duration && video.currentTime >= Math.min(7.9, video.duration - 0.08)) {
        handleExit();
      }
    };

    const handleEnded = () => {
      handleExit();
    };

    const handleError = () => {
      setUseStaticFallback(true);
      window.setTimeout(handleExit, 2000);
    };

    // Pause on hidden tab, resume when tab is active
    const handleVisibilityChange = () => {
      if (document.hidden) {
        video.pause();
      } else if (!isExiting) {
        video.play().catch(() => {});
      }
    };

    video.addEventListener("loadeddata", handleCanPlay);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("canplaythrough", handleCanPlay);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // If video is already ready in cache
    if (video.readyState >= 2) {
      handleCanPlay();
    }

    return () => {
      video.removeEventListener("loadeddata", handleCanPlay);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("canplaythrough", handleCanPlay);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      video.pause();
    };
  }, [showIntro, useStaticFallback, isExiting, handleExit]);

  // Keyboard navigation (Escape to finish intro)
  useEffect(() => {
    if (!showIntro) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleExit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showIntro, handleExit]);

  if (!showIntro) return null;

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          key="kavach-intro-splash"
          role="dialog"
          aria-label="Kavach intro animation"
          aria-live="off"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          onClick={isMuted ? forceUnmute : undefined}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            width: "100vw",
            height: "100dvh",
            backgroundColor: "var(--intro-bg, #dfe5e6)",
            backgroundImage: "radial-gradient(ellipse at 50% 45%, #eef3f6 0%, #dfe5e6 70%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            cursor: "default",
          }}
        >
          {/* Visually hidden screen reader text alternative */}
          <span className="sr-only">
            Kavach. Cyber awareness. Human defence.
          </span>

          {/* Main Logo Animation Container (Centred, Feathered Seamless Edges) */}
          <motion.div
            initial={{ scale: 1, filter: "blur(0px)" }}
            exit={{ scale: 1.04, filter: "blur(6px)" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex items-center justify-center w-[min(94vw,560px)] sm:w-[min(82vw,1020px)] aspect-video select-none border-none outline-none"
          >
            {useStaticFallback ? (
              /* Fallback static lockup for slow connections, data-saver, or unsupported video codecs */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full h-full flex items-center justify-center p-6"
              >
                <img
                  src="/intro/kavach-final.png"
                  alt="Kavach — Cyber awareness. Human defence."
                  className="max-w-full max-h-full object-contain drop-shadow-sm border-none outline-none"
                />
              </motion.div>
            ) : (
              /* High-Definition Seamless Video Brand Animation with Feathered Mask */
              <div
                className="relative w-full h-full flex items-center justify-center intro-video-wrap border-none outline-none"
                style={{
                  WebkitMaskImage: "radial-gradient(ellipse 46% 44% at 50% 50%, #000 0%, #000 36%, rgba(0, 0, 0, 0.85) 50%, rgba(0, 0, 0, 0.3) 72%, transparent 92%)",
                  maskImage: "radial-gradient(ellipse 46% 44% at 50% 50%, #000 0%, #000 36%, rgba(0, 0, 0, 0.85) 50%, rgba(0, 0, 0, 0.3) 72%, transparent 92%)",
                }}
              >
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  preload="auto"
                  disablePictureInPicture
                  disableRemotePlayback
                  controlsList="nodownload noplaybackrate noremoteplayback"
                  poster="/intro/kavach-poster.jpg"
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-full h-full object-contain pointer-events-none transition-opacity duration-300 border-none outline-none shadow-none ring-0"
                  style={{
                    opacity: isVideoReady ? 1 : 0.95,
                    border: "none",
                    outline: "none",
                  }}
                >
                  <source src="/intro/kavach-intro.webm" type="video/webm" />
                  <source src="/intro/kavach-intro.mp4" type="video/mp4" />
                </video>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
