import { useEffect, useState } from "react";
import "./LogoIntro.css";

const INTRO_KEY = "impactxLogoIntroPlayed";
const EXIT_DELAY = 1100;
const COMPLETE_DELAY = 1520;
const REDUCED_EXIT_DELAY = 120;
const REDUCED_COMPLETE_DELAY = 220;

export function shouldShowLogoIntro() {
  if (typeof window === "undefined") return false;
  try {
    return window.location.pathname === "/" && sessionStorage.getItem(INTRO_KEY) !== "true";
  } catch {
    return window.location.pathname === "/";
  }
}

export default function LogoIntro({ onComplete }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const exitDelay = reduceMotion ? REDUCED_EXIT_DELAY : EXIT_DELAY;
    const completeDelay = reduceMotion ? REDUCED_COMPLETE_DELAY : COMPLETE_DELAY;

    document.body.style.overflow = "hidden";

    const exitTimer = window.setTimeout(() => setExiting(true), exitDelay);
    const doneTimer = window.setTimeout(() => {
      try {
        sessionStorage.setItem(INTRO_KEY, "true");
      } catch {
        // Ignore storage errors in restricted browsing contexts.
      }
      document.body.style.overflow = previousOverflow;
      onComplete?.();
    }, completeDelay);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
      document.body.style.overflow = previousOverflow;
    };
  }, [onComplete]);

  return (
    <div className={`logo-intro ${exiting ? "logo-intro--exit" : ""}`} aria-label="IMPACTX logo intro">
      <div className="logo-intro__stage">
        <div className="logo-intro__mark" role="img" aria-label="IMPACTX">
          <img className="logo-intro__piece logo-intro__x-left" src="/logo-intro/impactx-logo-x-left.webp" alt="" aria-hidden="true" />
          <img className="logo-intro__piece logo-intro__x-right" src="/logo-intro/impactx-logo-x-right.webp" alt="" aria-hidden="true" />
          <img className="logo-intro__piece logo-intro__i" src="/logo-intro/impactx-logo-i.webp" alt="" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
