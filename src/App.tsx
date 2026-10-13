import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";
import { BLOCKCHAIN_ROUTE } from "@/components/estroc/SiteChrome";
import { HEADER_OFFSET, useLenis, useScrollTo } from "@/lib/smoothScroll";

// Split out so the homepage bundle does not carry a page most visitors never open.
const BlockchainWeb3 = lazy(() => import("@/pages/BlockchainWeb3"));

/**
 * Lenis keeps its own scroll position, so a route change would otherwise open
 * the next page wherever the last one was left. A hash ("/#start-a-project",
 * sent by the navbar from another page) lands on that section once the page
 * has rendered: a jump rather than a glide across the whole page, re-checked
 * briefly in case images or fonts above it settle late and push it down.
 */
function RouteScroll() {
  const { pathname, hash, key } = useLocation();
  const lenis = useLenis();
  const scrollToId = useScrollTo();

  useEffect(() => {
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo({ top: 0, behavior: "instant" });
    if (!hash) return;

    const id = decodeURIComponent(hash.slice(1));
    const timers = [60, 450, 1100].map((delay) =>
      window.setTimeout(() => {
        const top = document.getElementById(id)?.getBoundingClientRect().top;
        if (top !== undefined && Math.abs(top - HEADER_OFFSET) > 4) scrollToId(id, { immediate: true });
      }, delay),
    );
    // The moment the visitor takes over, stop correcting.
    const stop = () => timers.forEach(window.clearTimeout);
    const inputs = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    inputs.forEach((type) => window.addEventListener(type, stop, { once: true, passive: true }));
    return () => {
      stop();
      inputs.forEach((type) => window.removeEventListener(type, stop));
    };
    // Keyed on the navigation alone: Lenis starting up later must not jump the page.
  }, [pathname, hash, key]);

  return null;
}

// One <Route> per page in src/pages; BrowserRouter already wraps this in main.tsx.
export default function App() {
  return (
    <>
      <RouteScroll />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path={BLOCKCHAIN_ROUTE}
          element={
            <Suspense fallback={<div className="min-h-screen bg-[#0a0a0b]" />}>
              <BlockchainWeb3 />
            </Suspense>
          }
        />
        {/* A stray URL lands on a page that says so, rather than being bounced to
            the homepage as though nothing happened. */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
