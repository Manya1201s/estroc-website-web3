import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";
import { BLOCKCHAIN_ROUTE } from "@/components/estroc/SiteChrome";
import { useLenis, useScrollTo } from "@/lib/smoothScroll";

// Split out so the homepage bundle does not carry a page most visitors never open.
const BlockchainWeb3 = lazy(() => import("@/pages/BlockchainWeb3"));

/**
 * Lenis keeps its own scroll position, so a route change would otherwise open
 * the next page wherever the last one was left. A hash ("/#work", sent by the
 * navbar from another page) lands on that section once the page has rendered.
 */
function RouteScroll() {
  const { pathname, hash } = useLocation();
  const lenis = useLenis();
  const scrollToId = useScrollTo();

  useEffect(() => {
    if (hash) {
      const timer = window.setTimeout(() => scrollToId(decodeURIComponent(hash.slice(1))), 80);
      return () => window.clearTimeout(timer);
    }
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
    // Keyed on the URL alone: Lenis starting up later must not jump the page.
  }, [pathname, hash]);

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
