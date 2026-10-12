import { useEffect } from "react";
import { ArrowUpRight, Instagram, Linkedin, Mail, Menu, Phone, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import FooterWordmark from "@/components/estroc/FooterWordmark";
import ScrollProgress from "@/components/estroc/ScrollProgress";
import ThemeToggle from "@/components/estroc/ThemeToggle";
import { useLenis, useScrollTo } from "@/lib/smoothScroll";
import { useTheme } from "@/lib/theme";

/**
 * The navbar, mobile menu and footer, shared by every full page so the site
 * has exactly one of each. A target is either a route ("/blockchain-web3") or
 * a section id; an id that is not on the current page sends the visitor to
 * that section on the homepage instead.
 */

export const BLOCKCHAIN_ROUTE = "/blockchain-web3";

const navLinks: [target: string, label: string][] = [
  ["work", "WORK"],
  ["build", "CAPABILITIES"],
  [BLOCKCHAIN_ROUTE, "WEB3"],
  ["why", "WHY ESTROC"],
  ["process", "HOW WE WORK"],
  ["about", "ABOUT"],
];

const legalLinks: [label: string, url: string][] = [
  ["Privacy policy", ""],
  ["Terms & conditions", ""],
];

const slug = (value: string) => value.replace(/^\//, "").toLowerCase().replaceAll(" ", "-");

export function useGoTo() {
  const scrollToId = useScrollTo();
  const navigate = useNavigate();

  return (target: string) => {
    if (target.startsWith("/")) {
      navigate(target);
      return;
    }
    if (document.getElementById(target)) {
      scrollToId(target);
      return;
    }
    navigate(`/#${target}`);
  };
}

interface SiteHeaderProps {
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
}

export function SiteHeader({ menuOpen, onMenuOpenChange }: SiteHeaderProps) {
  const reducedMotion = useReducedMotion();
  const { theme, toggleTheme } = useTheme();
  const lenis = useLenis();
  const goTo = useGoTo();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!menuOpen) return;

    lenis?.stop();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onMenuOpenChange(false);
      }
    };

    window.addEventListener("keydown", onKey);

    return () => {
      lenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, lenis, onMenuOpenChange]);

  const go = (target: string) => {
    goTo(target);
    onMenuOpenChange(false);
  };

  const current = (target: string) => (target === pathname ? "page" : undefined);

  return (
    <>
      {/* ========================= NAVBAR ========================= */}

      <header
        className="fixed inset-x-0 top-0 z-40 border-b border-white/[0.08] bg-[#0a0a0b]/80 backdrop-blur-xl"
        data-testid="site-navbar"
      >
        <ScrollProgress />

        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <button
            type="button"
            onClick={() => go(pathname === "/" ? "top" : "/")}
            className="text-3xl font-bold tracking-[-0.07em] text-zinc-100 transition-colors hover:text-[#ff5500] sm:text-4xl"
            aria-label="ESTROC home"
            data-testid="nav-logo-button"
          >
            ESTROC<span className="text-[#ff5500]">.</span>
          </button>

          <nav
            className="hidden items-center gap-5 lg:flex xl:gap-6"
            aria-label="Primary navigation"
          >
            {navLinks.map(([target, label]) => (
              <button
                key={target}
                type="button"
                onClick={() => go(target)}
                aria-current={current(target)}
                className={`text-sm font-mono uppercase tracking-[0.14em] transition-colors hover:text-zinc-100 ${
                  current(target) ? "text-[#ff5500]" : "text-zinc-500"
                }`}
                data-testid={`nav-${slug(target)}-link`}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <ThemeToggle
              theme={theme}
              onToggle={toggleTheme}
              testId="desktop-theme-toggle-button"
            />

            <Button
              type="button"
              size="lg"
              onClick={() => go("start-a-project")}
              data-testid="nav-start-project-button"
            >
              Start a project
              <ArrowUpRight className="ml-2 h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle
              theme={theme}
              onToggle={toggleTheme}
              testId="mobile-theme-toggle-button"
            />

            <button
              type="button"
              onClick={() => onMenuOpenChange(!menuOpen)}
              className="rounded-full border border-white/10 p-2 text-zinc-300"
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
              data-testid="nav-mobile-menu-button"
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ========================= MOBILE MENU ========================= */}

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 bottom-0 top-[72px] z-30 flex flex-col justify-between overflow-y-auto bg-[#0a0a0b] px-5 pb-10 pt-8 lg:hidden"
            aria-label="Mobile navigation"
            data-testid="nav-mobile-menu"
          >
            <div>
              {navLinks.map(([target, label], linkIndex) => (
                <motion.button
                  key={target}
                  type="button"
                  initial={reducedMotion ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: reducedMotion ? 0 : 0.05 * linkIndex,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  onClick={() => go(target)}
                  aria-current={current(target)}
                  className="flex w-full items-baseline gap-4 border-b border-white/[0.07] py-5 text-left"
                  data-testid={`mobile-nav-${slug(target)}-link`}
                >
                  <span className="text-[10px] font-mono tracking-[0.2em] text-zinc-600">
                    {String(linkIndex + 1).padStart(2, "0")}
                  </span>

                  <span
                    className={`text-3xl font-semibold tracking-[-0.04em] ${
                      current(target) ? "text-[#ff5500]" : "text-zinc-200"
                    }`}
                  >
                    {label}
                  </span>
                </motion.button>
              ))}
            </div>

            <div className="pt-10">
              <Button
                type="button"
                className="w-full"
                size="lg"
                onClick={() => go("start-a-project")}
                data-testid="mobile-nav-start-project-button"
              >
                Start a project
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>

              <p
                className="mt-7 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-600"
                data-testid="mobile-nav-status"
              >
                ESTROC / India — building for the world
              </p>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}

export function SiteFooter() {
  const goTo = useGoTo();

  return (
    <footer
      id="about"
      className="border-t border-white/[0.08]"
      data-testid="site-footer"
    >
      <div className="mx-auto max-w-7xl px-5 pb-8 pt-20 sm:px-8 lg:px-10">
        <div className="grid gap-12 border-b border-white/10 pb-16 lg:grid-cols-[1.5fr_0.8fr_0.8fr_0.7fr]">

          {/* FOOTER BRAND */}
          <div>
            <p
              className="text-2xl font-bold tracking-[-0.07em] text-zinc-100"
              data-testid="footer-logo"
            >
              ESTROC<span className="text-[#ff5500]">.</span>
            </p>

            <p
              className="mt-6 max-w-sm text-sm leading-relaxed text-zinc-500"
              data-testid="footer-description"
            >
              ESTROC builds digital products, custom software and AI-powered
              solutions for businesses, startups and founders.
            </p>

            <p
              className="mt-10 max-w-sm text-xs leading-relaxed text-zinc-600"
              data-testid="footer-about-copy"
            >
              ESTROC is a technology studio focused on building modern
              digital products, software and AI solutions. We work with ideas
              at different stages — from early concepts and MVPs to existing
              products that need to evolve.
            </p>
          </div>

          {/* NAVIGATION */}
          <FooterColumn
            title="Navigation"
            links={[
              ["Work", "work"],
              ["Capabilities", "build"],
              ["Blockchain & Web3", BLOCKCHAIN_ROUTE],
              ["Why ESTROC", "why"],
              ["How we work", "process"],
              ["About", "about"],
              ["Contact", "start-a-project"],
            ]}
            onNavigate={goTo}
            testId="footer-navigation"
          />

          {/* SERVICES */}
          <FooterColumn
            title="Services"
            links={[
              ["Web development", "build"],
              ["Mobile apps", "build"],
              ["SaaS", "build"],
              ["Custom software", "build"],
              ["CRM", "build"],
              ["AI solutions", "build"],
              ["Automation", "build"],
              ["Blockchain", BLOCKCHAIN_ROUTE],
            ]}
            onNavigate={goTo}
            testId="footer-services"
          />

          <div>
          <p
            className="text-[10px] font-mono uppercase tracking-[0.22em] text-zinc-600"
            data-testid="footer-connect-title"
          >
            Connect
          </p>

          <div className="mt-5 space-y-4">

            {/* HELLO EMAIL */}
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 shrink-0 text-zinc-600" />

              <a
                href="mailto:hello@estroc.co.in"
                className="text-sm text-zinc-300 transition-colors hover:text-[#ff5500]"
              >
                hello@estroc.co.in
              </a>

              <button
                type="button"
                onClick={() =>
                  navigator.clipboard.writeText("hello@estroc.co.in")
                }
                className="text-zinc-600 transition-colors hover:text-zinc-300"
                aria-label="Copy email address"
              >
                <span className="text-xs">▢</span>
              </button>
            </div>

            {/* SALES */}
            <a
              href="mailto:sales@estroc.co.in"
              className="group flex items-center gap-3 text-sm text-zinc-300 transition-colors hover:text-[#ff5500]"
            >
              <Mail className="h-4 w-4 text-zinc-600 group-hover:text-[#ff5500]" />
              <span>sales@estroc.co.in</span>
           </a>

          {/* CAREERS */}
          <a
            href="mailto:careers@estroc.co.in"
            className="group flex items-center gap-3 text-sm text-zinc-300 transition-colors hover:text-[#ff5500]"
          >
            <Mail className="h-4 w-4 text-zinc-600 group-hover:text-[#ff5500]" />
            <span>careers@estroc.co.in</span>
          </a>

          {/* PHONE */}
          <a
            href="tel:+918448063275"
            className="group flex items-center gap-3 text-sm text-zinc-300 transition-colors hover:text-[#ff5500]"
          >
            <Phone className="h-4 w-4 text-zinc-600 group-hover:text-[#ff5500]" />
            <span>+91 8448063275</span>
          </a>

          {/* WHATSAPP */}
          <a
            href="https://wa.me/918448063275"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 text-sm text-zinc-300 transition-colors hover:text-[#25D366]"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 text-[#25D366]"
              fill="currentColor"
            >
              <path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.15 1.6 5.96L.05 24l6.28-1.65a11.86 11.86 0 0 0 5.73 1.47h.01c6.56 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.17-3.45-8.44ZM12.07 21.8h-.01a9.87 9.87 0 0 1-5.03-1.37l-.36-.21-3.73.98 1-3.64-.23-.37a9.87 9.87 0 0 1-1.51-5.28C2.2 6.46 6.63 2.2 12.07 2.2c2.63 0 5.1 1.03 6.96 2.89a9.77 9.77 0 0 1 2.88 6.95c0 5.4-4.43 9.76-9.84 9.76Zm5.38-7.32c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.48-1.75-1.65-2.05-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5s1.07 2.9 1.22 3.1c.15.2 2.1 3.2 5.09 4.49.71.31 1.26.5 1.69.64.71.23 1.35.2 1.86.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
            </svg>

            <span>WhatsApp</span>
          </a>

          {/* LINKEDIN */}
          <a
            href="https://www.linkedin.com/company/estroctech/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 text-sm text-zinc-300 transition-colors hover:text-[#0A66C2]"
          >
            <Linkedin className="h-4 w-4 text-[#0A66C2]" />
            <span>LinkedIn</span>
          </a>

          {/* INSTAGRAM */}
          <a
            href="https://www.instagram.com/estroctech/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 text-sm text-zinc-300 transition-colors hover:text-[#E1306C]"
          >
            <Instagram className="h-4 w-4 text-[#E1306C]" />
            <span>@estroctech</span>
          </a>

        </div>
      </div>

      </div>

        {/* FOOTER BOTTOM */}
        <div className="flex flex-col gap-3 pt-7 text-[10px] font-mono uppercase tracking-[0.16em] text-zinc-600 sm:flex-row sm:items-center sm:justify-between" />

        <div className="flex flex-col gap-4 pt-4 text-[10px] font-mono uppercase tracking-[0.16em] text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-6">
            {legalLinks.map(([label, url]) =>
              url ? (
                <a
                  key={label}
                  href={url}
                  className="transition-colors hover:text-zinc-300"
                  data-testid={`footer-${label
                    .split(" ")[0]
                    .toLowerCase()}-link`}
                >
                  {label}
                </a>
              ) : (
                <span
                  key={label}
                  data-testid={`footer-${label
                    .split(" ")[0]
                    .toLowerCase()}-text`}
                >
                  {label}
                </span>
              )
            )}
          </div>

          <p data-testid="footer-copyright">
            © {new Date().getFullYear()} ESTROC. All rights reserved.
          </p>
        </div>

        <FooterWordmark />
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
  onNavigate,
  testId,
}: {
  title: string;
  links: string[][];
  onNavigate: (target: string) => void;
  testId: string;
}) {
  return (
    <div data-testid={testId}>
      <p
        className="text-[10px] font-mono uppercase tracking-[0.22em] text-zinc-600"
        data-testid={`${testId}-title`}
      >
        {title}
      </p>

      <div className="mt-4 space-y-3">
        {links.map(([label, target]) => (
          <button
            key={label}
            type="button"
            onClick={() => onNavigate(target)}
            className="block text-left text-sm text-zinc-400 transition-colors hover:text-[#ff5500]"
            data-testid={`${testId}-${label
              .toLowerCase()
              .replaceAll(" ", "-")}-link`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
