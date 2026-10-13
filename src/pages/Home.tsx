import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  Check,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import Chatbot from "@/components/estroc/Chatbot";
import EditorialStatement from "@/components/estroc/EditorialStatement";
import EstrocEngine from "@/components/estroc/EstrocEngine";
import GlobalReach from "@/components/estroc/GlobalReach";
import Manifesto from "@/components/estroc/Manifesto";
import Grain from "@/components/estroc/Grain";
import HeroProductInterface from "@/components/estroc/HeroProductInterface";
import { MaskLines, Rise } from "@/components/estroc/MaskReveal";
import ProjectForm from "@/components/estroc/ProjectForm";
import SectionHeading from "@/components/estroc/SectionHeading";
import ServicesMarquee from "@/components/estroc/ServicesMarquee";
import Testimonials from "@/components/estroc/Testimonials";
import { BLOCKCHAIN_ROUTE, SiteFooter, SiteHeader, VISION_ROUTE } from "@/components/estroc/SiteChrome";
import type { EnquiryNavState } from "@/components/estroc/SiteChrome";
import WorkSection from "@/components/estroc/WorkSection";
import { buildCategories } from "@/lib/services";
import { useScrollTo } from "@/lib/smoothScroll";

const reasons = [
  [
    "BUILD FROM THE IDEA",
    "We work from the idea stage, turning early concepts into clear, buildable digital products.",
  ],
  [
    "PRODUCT + TECHNOLOGY",
    "Design, development, software engineering and AI come together under one team.",
  ],
  [
    "BUILT AROUND YOUR NEEDS",
    "No rigid packages or one-size-fits-all solutions. Every product is built around the actual business requirement.",
  ],
  [
    "READY TO MOVE FORWARD",
    "From MVPs to production-ready platforms, we build with real-world usability, performance and future growth in mind.",
  ],
];

const timelineStages = [
  [
    "DISCOVER",
    "Understand the idea, business goals, users and requirements.",
    "Idea / context",
  ],
  [
    "DEFINE",
    "Turn requirements into a clear product direction, scope and roadmap.",
    "Scope / roadmap",
  ],
  [
    "DESIGN",
    "Create the user experience, interface and product architecture before development.",
    "Experience / system",
  ],
  [
    "BUILD",
    "Develop, integrate, test and refine the product using the right technology.",
    "Code / integrations",
  ],
  [
    "LAUNCH",
    "Deploy the product, monitor the experience and make the final improvements.",
    "Live / learning",
  ],
  [
    "EVOLVE",
    "Maintain, monitor and keep improving the product — new features, scale and security as the business grows.",
    "Support / scale",
  ],
];

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const [activeStage, setActiveStage] = useState(0);

  const reducedMotion = useReducedMotion();

  const timelineRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);

  const scrollToId = useScrollTo();

  // Another page can send the visitor here with the form pre-selected (useOpenEnquiry).
  const location = useLocation();
  const sentPrefill = (location.state as EnquiryNavState | null)?.enquiryPrefill;
  // Keyed on the history entry, so each arrival applies its prefill exactly once.
  const enquiryPrefill = useMemo(
    () => (sentPrefill ? { ...sentPrefill, key: Date.now() } : undefined),
    [location.key],
  );

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(heroProgress, [0, 1], ["0%", "-14%"]);
  const heroOpacity = useTransform(heroProgress, [0, 0.75], [1, 0]);
  const interfaceY = useTransform(heroProgress, [0, 1], ["0%", "-5%"]);

  useEffect(() => {
    const nodes =
      timelineRef.current?.querySelectorAll<HTMLElement>(
        "[data-stage-index]"
      );

    if (!nodes) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveStage(
              Number((entry.target as HTMLElement).dataset.stageIndex)
            );
          }
        });
      },
      {
        rootMargin: "-35% 0px -45% 0px",
        threshold: 0,
      }
    );

    nodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    const form = ctaRef.current;

    if (!hero || !form) return;

    let heroVisible = true;
    let formVisible = false;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === hero) {
            heroVisible = entry.isIntersecting;
          }

          if (entry.target === form) {
            formVisible = entry.isIntersecting;
          }
        });

        setShowStickyCta(!heroVisible && !formVisible);
      },
      { threshold: 0 }
    );

    observer.observe(hero);
    observer.observe(form);

    return () => observer.disconnect();
  }, []);

  const scrollToProject = () => {
    scrollToId("start-a-project");
    setMobileMenuOpen(false);
  };

  const scrollTo = (id: string) => {
    scrollToId(id);
    setMobileMenuOpen(false);
  };

  const selectedCategory = buildCategories[activeCategory];

  return (
    <div
      className="min-h-screen overflow-x-clip bg-[#0a0a0b] text-[#f5f5f7] selection:bg-[#ff5500] selection:text-[#0a0a0b]"
      data-testid="estroc-homepage"
    >
      <Toaster position="bottom-left" richColors />

      <Grain />

      <SiteHeader menuOpen={mobileMenuOpen} onMenuOpenChange={setMobileMenuOpen} />

      <main id="top">

        {/* ========================= HERO ========================= */}

        <section
          ref={heroRef}
          className="relative mx-auto grid min-h-screen max-w-7xl content-center items-center px-5 pb-20 pt-32 [--hero-type:clamp(3.7rem,8vw,7.2rem)] sm:px-8 lg:grid-cols-[0.84fr_1.16fr] lg:gap-x-16 lg:px-10 lg:pb-16 lg:pt-28"
          data-testid="hero-section"
        >
          <motion.div
            style={
              reducedMotion
                ? undefined
                : { y: heroY, opacity: heroOpacity }
            }
            className="relative z-10 max-w-xl lg:col-start-1 lg:row-start-1"
          >
            <Rise immediate className="mb-4" testId="hero-eyebrow">
              <p className="text-xs font-mono uppercase tracking-[0.24em] text-[#ff5500] sm:text-sm">
                From idea to production
              </p>
            </Rise>
          </motion.div>

          <motion.div
            style={
              reducedMotion
                ? undefined
                : { y: heroY, opacity: heroOpacity }
            }
            className="relative z-10 max-w-xl lg:col-start-1 lg:row-start-2"
          >
            <MaskLines
              as="h1"
              immediate
              delay={0.12}
              lines={[
                "WE BUILD",
                <span className="text-zinc-500">WHAT COMES</span>,
                "NEXT",
              ]}
              className="text-[length:var(--hero-type)] font-bold leading-[0.9] tracking-[-0.085em] text-zinc-100"
              testId="hero-heading"
            />
          </motion.div>

          <motion.div
            style={
              reducedMotion
                ? undefined
                : { y: heroY, opacity: heroOpacity }
            }
            className="relative z-10 max-w-xl lg:col-start-1 lg:row-start-3"
          >
            <Rise immediate delay={0.5} className="mt-8" testId="hero-description">
              <p className="max-w-md text-base leading-relaxed text-zinc-400 sm:text-lg">
                ESTROC builds digital products, custom software and AI-powered
                solutions for businesses, startups and founders.
              </p>
            </Rise>

            <Rise immediate delay={0.6} className="mt-9 flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={() => scrollToProject()}
                data-testid="hero-start-project-button"
              >
                Start a project
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => scrollTo("work")}
                data-testid="hero-view-work-button"
              >
                View our work
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Rise>
          </motion.div>

          <motion.div
            style={reducedMotion ? undefined : { y: interfaceY }}
            className="relative order-last mt-12 self-stretch lg:order-none lg:col-start-2 lg:row-start-2 lg:mt-0 lg:pt-[calc(var(--hero-type)*0.1)] lg:pb-[calc(var(--hero-type)*0.21)]"
          >
            <HeroProductInterface />
          </motion.div>

          <motion.div
            style={reducedMotion ? undefined : { y: interfaceY }}
            className="order-last self-start lg:order-none lg:col-start-2 lg:row-start-3"
          >
            <div
              className="mt-4 flex justify-between text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-600 lg:mt-[calc(1rem_-_var(--hero-type)*0.21)]"
              data-testid="hero-interface-caption"
            >
              <span>Build console / shipped work</span>
              <span className="hidden sm:block">Live projects</span>
            </div>
          </motion.div>

          <motion.div
            style={reducedMotion ? undefined : { opacity: heroOpacity }}
            className="pointer-events-none absolute bottom-5 left-5 hidden items-center gap-3 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-600 lg:flex"
            data-testid="hero-scroll-cue"
          >
            <ArrowDown className="h-3.5 w-3.5 animate-bounce text-[#ff5500]" />
            Scroll to explore
          </motion.div>
        </section>

        <ServicesMarquee onSelect={scrollTo} />

        <EstrocEngine />

        {/* ========================= CAPABILITIES ========================= */}

        <section
          id="build"
          className="border-t border-white/[0.08]"
          data-testid="what-we-build-section"
        >
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
            <SectionHeading
              title="CAPABILITIES"
              copy="From first idea to production-ready product, ESTROC builds the software and technology businesses need to move forward."
            />

            <div className="mt-10 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="border-t border-white/10">
                {buildCategories.map((category, index) => {
                  const Icon = category.icon;

                  return (
                    <button
                      key={category.name}
                      type="button"
                      onClick={() => setActiveCategory(index)}
                      className={`group flex w-full items-center justify-between border-b border-white/10 py-5 text-left transition-colors ${
                        activeCategory === index
                          ? "text-zinc-100"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                      data-testid={`service-category-${category.name
                        .toLowerCase()
                        .replaceAll(" ", "-")}-button`}
                    >
                      <span className="flex items-center gap-4 text-xl font-medium tracking-tight sm:text-2xl">
                        <Icon
                          className={`h-5 w-5 transition-colors ${
                            activeCategory === index
                              ? "text-[#ff5500]"
                              : "text-zinc-700 group-hover:text-zinc-400"
                          }`}
                        />

                        {category.name}
                      </span>

                      <ArrowRight
                        className={`h-4 w-4 transition-transform ${
                          activeCategory === index
                            ? "translate-x-1 text-[#ff5500]"
                            : "text-zinc-700"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <motion.div
                key={selectedCategory.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden border border-white/10 bg-[#111113] p-7 sm:p-10"
                data-testid="service-detail-panel"
              >
                <div className="absolute right-8 top-8 text-[#ff5500]/20">
                  <Boxes className="h-24 w-24" />
                </div>

                <div className="relative">
                  <p
                    className="text-xs font-mono uppercase tracking-[0.22em] text-[#ff5500]"
                    data-testid="service-detail-kicker"
                  >
                    Active capability
                  </p>

                  <h3
                    className="mt-3 max-w-md text-3xl font-semibold tracking-[-0.04em] text-zinc-100 sm:text-4xl"
                    data-testid="service-detail-title"
                  >
                    {selectedCategory.name}
                  </h3>

                  <p
                    className="mt-5 max-w-md text-base leading-relaxed text-zinc-400"
                    data-testid="service-detail-description"
                  >
                    {selectedCategory.description}
                  </p>

                  <div className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                    {selectedCategory.services.map((service) => (
                      <div
                        key={service}
                        className="flex items-center gap-3 border-b border-white/[0.07] pb-3 text-sm text-zinc-300"
                        data-testid={`service-detail-${service
                          .toLowerCase()
                          .replaceAll(" ", "-")}`}
                      >
                        <Check className="h-3.5 w-3.5 text-[#ff5500]" />
                        {service}
                      </div>
                    ))}
                  </div>

                  {selectedCategory.services.includes("Blockchain") && (
                    <Link
                      to={BLOCKCHAIN_ROUTE}
                      className="mt-8 inline-flex items-center gap-2 text-sm text-zinc-200 underline-offset-4 transition-colors hover:text-[#ff5500] hover:underline"
                      data-testid="service-detail-blockchain-link"
                    >
                      Explore Blockchain &amp; Web3
                      <ArrowUpRight className="h-4 w-4 text-[#ff5500]" />
                    </Link>
                  )}

                  {selectedCategory.name === "Blockchain & Web3" && (
                    <Link
                      to={BLOCKCHAIN_ROUTE}
                      className="group/cta mt-9 inline-flex items-center gap-3 border border-[#ff5500] px-5 py-3 text-sm font-medium text-[#ff5500] transition-colors hover:bg-[#ff5500] hover:text-[#0a0a0b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff5500]"
                      data-testid="service-detail-explore-web3-link"
                    >
                      Explore Blockchain &amp; Web3
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/cta:translate-x-1" />
                    </Link>
                  )}

                  {selectedCategory.name === "AI & Automation" && (
                    <Link
                      to={VISION_ROUTE}
                      className="group/cta mt-9 inline-flex items-center gap-3 border border-[#ff5500] px-5 py-3 text-sm font-medium text-[#ff5500] transition-colors hover:bg-[#ff5500] hover:text-[#0a0a0b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff5500]"
                      data-testid="service-detail-explore-vision-link"
                    >
                      Explore Computer Vision &amp; Visual AI
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/cta:translate-x-1" />
                    </Link>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <WorkSection />

        <EditorialStatement
          lines={[
            "TECHNOLOGY SHOULD",
            "DISAPPEAR INTO",
            <span className="text-zinc-500">THE EXPERIENCE.</span>,
          ]}
          footnote="We engineer the systems behind it."
          testId="editorial-statement-technology"
        />

        {/* ========================= WHY ESTROC ========================= */}

        <section
          id="why"
          className="border-t border-white/[0.08]"
          data-testid="why-estroc-section"
        >
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
            <SectionHeading
              title="WHY ESTROC"
              copy="Not just developers. A technology partner that turns ideas into products."
            />

            <div className="mt-10 border-t border-white/10">
              {reasons.map(([title, copy], index) => (
                <Rise
                  key={title}
                  delay={index * 0.05}
                  className="reason-row group relative grid gap-5 overflow-hidden border-b border-white/10 py-7 sm:grid-cols-[0.8fr_1.2fr] sm:items-center sm:px-4"
                >
                  <span className="reason-wipe" aria-hidden="true" />

                  <h3
                    className="relative text-xl font-medium tracking-tight text-zinc-300 transition-[color,transform] duration-500 group-hover:translate-x-2 group-hover:text-[#ff5500]"
                    data-testid={`reason-${title
                      .toLowerCase()
                      .replaceAll(" ", "-")}-title`}
                  >
                    {title}
                  </h3>

                  <p
                    className="relative max-w-xl text-sm leading-relaxed text-zinc-500 transition-colors duration-500 group-hover:text-zinc-200"
                    data-testid={`reason-${title
                      .toLowerCase()
                      .replaceAll(" ", "-")}-copy`}
                  >
                    {copy}
                  </p>
                </Rise>
              ))}
            </div>
          </div>
        </section>

        {/* ========================= PROCESS ========================= */}

        <section
          id="process"
          className="border-t border-white/[0.08]"
          data-testid="how-we-work-section"
        >
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
            <SectionHeading
              title="HOW WE WORK"
              copy="A clear path from the first conversation to a product that is ready to launch."
            />

            <div
              ref={timelineRef}
              className="relative mt-12 max-w-5xl"
              data-testid="process-timeline"
            >
              <div className="absolute bottom-0 left-[7px] top-0 w-px bg-white/10 sm:left-[11px]">
                <motion.div
                  className="w-full origin-top bg-[#ff5500]"
                  animate={{
                    height: `${
                      (activeStage / (timelineStages.length - 1)) * 100
                    }%`,
                  }}
                  transition={{ duration: reducedMotion ? 0 : 0.45 }}
                  data-testid="process-timeline-progress"
                />
              </div>

              {timelineStages.map(([title, copy, detail], index) => (
                <div
                  key={title}
                  data-stage-index={index}
                  className="relative grid gap-5 pb-16 pl-10 last:pb-0 sm:grid-cols-[0.6fr_1.4fr] sm:gap-12 sm:pl-12"
                  data-testid={`process-stage-${title.toLowerCase()}`}
                >
                  <span
                    className={`absolute left-0 top-1 h-[15px] w-[15px] rounded-full border-2 transition-colors sm:h-[23px] sm:w-[23px] ${
                      index <= activeStage
                        ? "border-[#ff5500] bg-[#ff5500] shadow-[0_0_18px_rgba(255,85,0,0.35)]"
                        : "border-zinc-700 bg-[#0a0a0b]"
                    }`}
                  >
                    <span className="absolute inset-[3px] rounded-full bg-[#0a0a0b]" />
                  </span>

                  <div>
                    <p
                      className={`text-xs font-mono uppercase tracking-[0.22em] transition-colors ${
                        index <= activeStage
                          ? "text-[#ff5500]"
                          : "text-zinc-600"
                      }`}
                      data-testid={`process-stage-${title.toLowerCase()}-label`}
                    >
                      {title}
                    </p>

                    <p
                      className="mt-2 text-xs font-mono uppercase tracking-wider text-zinc-700"
                      data-testid={`process-stage-${title.toLowerCase()}-detail`}
                    >
                      {detail}
                    </p>
                  </div>

                  <div>
                    <h3
                      className={`text-2xl font-semibold tracking-tight transition-colors sm:text-3xl ${
                        index === activeStage
                          ? "text-zinc-100"
                          : "text-zinc-500"
                      }`}
                      data-testid={`process-stage-${title.toLowerCase()}-title`}
                    >
                      {title}
                    </h3>

                    <p
                      className={`mt-3 max-w-lg text-sm leading-relaxed transition-colors ${
                        index === activeStage
                          ? "text-zinc-300"
                          : "text-zinc-600"
                      }`}
                      data-testid={`process-stage-${title.toLowerCase()}-copy`}
                    >
                      {copy}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Manifesto />

        <GlobalReach />

        <Testimonials />

        {/* ========================= START PROJECT ========================= */}

        <section
          ref={ctaRef}
          id="start-a-project"
          className="border-t border-white/[0.08]"
          data-testid="start-project-section"
        >
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
              <div>
                <SectionHeading
                  title="START A PROJECT"
                  copy="Have an idea, product or problem you want to build? Tell us what you're working on."
                />

                <div
                  className="mt-10 flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-600"
                  data-testid="project-form-note"
                >
                  <span className="h-px w-7 bg-[#ff5500]" />
                  Share your details / we'll take it from there
                </div>
              </div>

              <ProjectForm prefill={enquiryPrefill} />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />

      {/* ========================= STICKY CTA ========================= */}

      <AnimatePresence>
        {showStickyCta && !mobileMenuOpen && (
          <motion.button
            type="button"
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: 12 }}
            transition={{ duration: 0.25 }}
            onClick={() => scrollToProject()}
            className="fixed bottom-5 left-5 z-30 flex items-center gap-2 bg-[#ff5500] px-4 py-3 text-xs font-medium text-[#0a0a0b] shadow-xl shadow-black/30 lg:hidden"
            data-testid="sticky-start-project-button"
          >
            Start a project
            <ArrowUpRight className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>

      <Chatbot hidden={mobileMenuOpen} />
    </div>
  );
}