"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ShieldAlert, RefreshCw } from "lucide-react";

declare global {
  interface Window {
    __TG_ADS_ALLOWED?: boolean;
  }
}

const BAIT_CLASSNAMES = [
  "adsbox",
  "ad-banner",
  "ad-slot",
  "advertisement",
  "adsbygoogle",
  "sponsored-content",
].join(" ");

function isBaitHidden(node: HTMLElement) {
  const style = window.getComputedStyle(node);
  return (
    style.display === "none" ||
    style.visibility === "hidden" ||
    Number.parseFloat(style.opacity) === 0 ||
    node.offsetHeight === 0
  );
}

function ensureAdsBaitScript() {
  if (document.getElementById("tg-ads-bait")) {
    return Promise.resolve(window.__TG_ADS_ALLOWED === true);
  }

  return new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.id = "tg-ads-bait";
    script.src = `/ads.js?v=1`;
    script.async = true;
    script.onload = () => resolve(window.__TG_ADS_ALLOWED === true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
    window.setTimeout(() => resolve(window.__TG_ADS_ALLOWED === true), 1200);
  });
}

export function AdBlockDetector() {
  const baitRef = useRef<HTMLDivElement>(null);
  const [blocked, setBlocked] = useState(false);
  const [checking, setChecking] = useState(true);

  const runDetection = useCallback(async () => {
    const baitBlocked = baitRef.current ? isBaitHidden(baitRef.current) : false;
    const scriptAllowed = await ensureAdsBaitScript();
    const detected = baitBlocked || !scriptAllowed;

    setBlocked(detected);
    setChecking(false);
    document.body.style.overflow = detected ? "hidden" : "";
  }, []);

  useEffect(() => {
    const start = window.setTimeout(() => {
      void runDetection();
    }, 350);
    const interval = window.setInterval(() => {
      const baitBlocked = baitRef.current ? isBaitHidden(baitRef.current) : false;
      const scriptBlocked = window.__TG_ADS_ALLOWED !== true;
      const detected = baitBlocked || scriptBlocked;
      setBlocked(detected);
      document.body.style.overflow = detected ? "hidden" : "";
    }, 2500);

    return () => {
      window.clearTimeout(start);
      window.clearInterval(interval);
      document.body.style.overflow = "";
    };
  }, [runDetection]);

  return (
    <>
      <div
        ref={baitRef}
        aria-hidden
        className={BAIT_CLASSNAMES}
        style={{
          position: "absolute",
          left: "-10000px",
          top: "-10000px",
          width: "300px",
          height: "250px",
          background: "#fff",
          pointerEvents: "none",
        }}
      />

      {blocked ? (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="adblock-title"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/90 p-4 backdrop-blur-md"
        >
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-ink-800 p-8 shadow-panel">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-glow text-accent">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h1 id="adblock-title" className="text-2xl font-semibold tracking-tight text-white">
              Un AdBlocker è attivo
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-zinc-300">
              Testing-Grounds è gratuita per sviluppatori e tester. I banner
              pubblicitari, discreti e non invasivi, coprono i costi di hosting
              e permettono alla community indie di restare aperta a tutti.
            </p>
            <ol className="mt-5 list-decimal space-y-2 pl-5 text-sm text-zinc-200">
              <li>Disattiva l&apos;estensione AdBlock su questo sito.</li>
              <li>Ricarica la pagina per continuare a esplorare i playtest.</li>
            </ol>
            <button
              type="button"
              onClick={() => {
                setChecking(true);
                window.location.reload();
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-accent-dim"
            >
              <RefreshCw className={`h-4 w-4 ${checking ? "animate-spin" : ""}`} />
              Ho disattivato AdBlock
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
