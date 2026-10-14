import { useRef, useState } from "react";
import { ArrowDown, ArrowUpRight, Factory, Microscope, ShieldCheck, ShoppingBag, Sprout, UtilityPole, Warehouse } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import Chatbot from "@/components/estroc/Chatbot";
import CopyEmail from "@/components/estroc/CopyEmail";
import Grain from "@/components/estroc/Grain";
import { MaskLines, Rise } from "@/components/estroc/MaskReveal";
import { SiteFooter, SiteHeader, VISION_ROUTE, useOpenEnquiry } from "@/components/estroc/SiteChrome";
import CapabilityCards from "@/components/estroc/vision/CapabilityCards";
import VisionDemo from "@/components/estroc/vision/VisionDemo";
import { HeroScene } from "@/components/estroc/vision/VisionGraphics";
import VisionInspectLive from "@/components/estroc/vision/VisionInspectLive";
import VisionShowcase from "@/components/estroc/vision/VisionShowcase";
import { SectionIntro, focusRing } from "@/components/estroc/web3/shared";
import { visionOptions, visionUseCases } from "@/lib/visionContent";
import { useScrollTo } from "@/lib/smoothScroll";
import { usePageMeta } from "@/lib/usePageMeta";

const VISION_INTEREST = "Computer Vision / Visual AI";

const meta = {
  title: "Computer Vision & Visual AI | ESTROC",
  description:
    "ESTROC builds custom computer vision solutions, including object detection and tracking, quality inspection, OCR and document intelligence, video analytics and visual search.",
  path: VISION_ROUTE,
};

const useCaseIcons = {
  manufacturing: Factory,
  retail: ShoppingBag,
  logistics: Warehouse,
  healthcare: Microscope,
  agriculture: Sprout,
  infrastructure: UtilityPole,
} as const;

export default function ComputerVision() {
  const [menuOpen, setMenuOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const scrollToId = useScrollTo();
  const openEnquiry = useOpenEnquiry();
  const heroRef = useRef<HTMLElement>(null);

  usePageMeta(meta);

  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroProgress, [0, 1], ["0%", "-14%"]);
  const heroOpacity = useTransform(heroProgress, [0, 0.75], [1, 0]);
  const sceneY = useTransform(heroProgress, [0, 1], ["0%", "-6%"]);

  /**
   * Every CTA opens the one enquiry form on the homepage with Computer Vision
   * ticked. A message is only suggested when the visitor hasn't written one.
   */
  const enquire = (message?: string) => openEnquiry({ interest: VISION_INTEREST, message });
  const discussTopic = (topic: string) => enquire(`I'd like to discuss ${topic}.`);

  return (
    <div
      className="min-h-screen overflow-x-clip bg-[#0a0a0b] text-[#f5f5f7] selection:bg-[#ff5500] selection:text-[#0a0a0b]"
      data-testid="computer-vision-page"
    >
      <Toaster position="bottom-left" richColors />
      <Grain />
      <SiteHeader menuOpen={menuOpen} onMenuOpenChange={setMenuOpen} />

      <main id="top">
        {/* ========================= HERO ========================= */}

        <section
          ref={heroRef}
          className="relative mx-auto grid min-h-screen max-w-7xl content-center items-center gap-y-12 px-5 pb-20 pt-32 [--hero-type:clamp(2.9rem,5.6vw,5.4rem)] sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-x-12 lg:px-10 lg:pb-16 lg:pt-28"
          data-testid="vision-hero-section"
        >
          <motion.div style={reducedMotion ? undefined : { y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-xl">
            <Rise immediate className="mb-5">
              <p className="text-xs font-mono uppercase tracking-[0.24em] text-[#ff5500] sm:text-sm">Computer Vision &amp; Visual AI</p>
            </Rise>

            <MaskLines
              as="h1"
              immediate
              delay={0.12}
              lines={["WE TURN", "VISUAL DATA", <span className="text-zinc-500">INTO ACTION.</span>]}
              className="text-[length:var(--hero-type)] font-bold leading-[0.92] tracking-[-0.08em] text-zinc-100"
              testId="vision-hero-heading"
            />

            <Rise immediate delay={0.5} className="mt-8">
              <p className="max-w-md text-base leading-relaxed text-zinc-400 sm:text-lg" data-testid="vision-hero-copy">
                From intelligent inspection to real-time object tracking, ESTROC builds custom computer vision solutions for real business workflows.
              </p>
            </Rise>

            <Rise immediate delay={0.6} className="mt-9 flex flex-wrap gap-3">
              <Button type="button" size="lg" onClick={() => scrollToId("projects")} className="px-4" data-testid="vision-hero-work-button">
                Explore Our Work
                <ArrowDown className="ml-2 h-4 w-4" />
              </Button>
              <Button type="button" size="lg" variant="outline" onClick={() => enquire()} className="px-4" data-testid="vision-hero-discuss-button">
                Discuss a Project
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </Rise>
          </motion.div>

          <motion.div style={reducedMotion ? undefined : { y: sceneY }} className="relative">
            <div className="absolute -inset-6 bg-[#ff5500]/[0.06] blur-3xl" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-[1.25rem] border border-white/10 shadow-2xl shadow-black/50" data-testid="vision-hero-scene">
              <HeroScene animate={!reducedMotion} />
            </div>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">Illustrative scene / simulated detections</p>
          </motion.div>
        </section>

        {/* ========================= VISIONINSPECT (LIVE DEMO) ========================= */}

        <section id="vision-inspect" className="border-t border-white/[0.08]" aria-labelledby="vision-inspect-title" data-testid="vision-inspect-section">
          <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
            <div className="mb-8 grid gap-x-12 gap-y-4 lg:grid-cols-[1fr_minmax(0,28rem)] lg:items-end">
              <div>
                <Rise>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#ff5500]">Interactive demo · AI-powered quality inspection</p>
                </Rise>
                <MaskLines
                  as="h2"
                  lines={[<span id="vision-inspect-title">VISIONINSPECT</span>, <span className="text-zinc-500">Precision You Can See.</span>]}
                  className="mt-3 text-4xl font-semibold leading-[1] tracking-[-0.06em] text-zinc-100 sm:text-6xl"
                  testId="vision-inspect-heading"
                />
              </div>
              <Rise delay={0.12}>
                <p className="text-base leading-relaxed text-zinc-400">
                  Automated visual inspection checks every part on a production line for scratches, cracks and alignment faults as it passes the
                  camera. Run the line below to see how it works. The parts, defects and results are simulated sample data, not live AI analysis.
                </p>
              </Rise>
            </div>
            <Rise delay={0.18}>
              <VisionInspectLive />
            </Rise>
          </div>
        </section>

        {/* ========================= WHAT WE BUILD ========================= */}

        <section id="capabilities" className="border-t border-white/[0.08]" data-testid="vision-capabilities-section">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
            <SectionIntro
              index="01"
              kicker="Capabilities"
              title={["WHAT WE", <span className="text-zinc-500">BUILD</span>]}
              copy="Six kinds of vision systems. Open any card for a real-world example."
              testId="vision-capabilities"
            />
            <CapabilityCards />
          </div>
        </section>

        {/* ========================= FEATURED PROJECTS ========================= */}

        <section id="projects" className="border-t border-white/[0.08] bg-[#0d0d0f]" data-testid="vision-projects-section">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-32">
            <SectionIntro
              index="02"
              kicker="Featured project concepts"
              title={["PRODUCTS", <span className="text-zinc-500">IN ACTION</span>]}
              copy="Three products ESTROC could build for you. Each screen works, so try the controls."
              testId="vision-projects"
            />
            <VisionShowcase onDiscuss={discussTopic} />
          </div>
        </section>

        {/* ========================= DEMO ========================= */}

        <section id="demo" className="border-t border-white/[0.08]" data-testid="vision-demo-section">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
            <SectionIntro
              index="03"
              kicker="Interactive demo"
              title={["DETECT. INSPECT.", <span className="text-zinc-500">EXTRACT.</span>]}
              copy="Pick a mode, then select a finding to see where it sits in the image."
              testId="vision-demo"
            />
            <VisionDemo />
          </div>
        </section>

        {/* ========================= WHERE IT CAN BE USED ========================= */}

        <section id="use-cases" className="border-t border-white/[0.08] bg-[#0d0d0f]" data-testid="vision-use-cases-section">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#ff5500]">04 / Where it can be used</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-zinc-100 sm:text-4xl">Across industries</h2>
              </div>
            </div>
            <ul className="mt-8 grid grid-cols-1 gap-px border border-white/10 bg-white/10 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-6" data-testid="vision-use-cases">
              {visionUseCases.map((useCase, index) => {
                const Icon = useCaseIcons[useCase.id as keyof typeof useCaseIcons];
                return (
                  <li key={useCase.id} className="group bg-[#0a0a0b] p-5 transition-colors hover:bg-[#111113]">
                    <Rise delay={index * 0.04}>
                      <Icon className="h-5 w-5 text-zinc-600 transition-colors group-hover:text-[#ff5500]" aria-hidden="true" />
                      <p className="mt-4 text-sm font-medium text-zinc-100">{useCase.name}</p>
                      <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">{useCase.example}</p>
                    </Rise>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* ========================= PROJECT OPTIONS ========================= */}

        <section id="build-options" className="border-t border-white/[0.08]" data-testid="vision-options-section">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
            <SectionIntro
              index="05"
              kicker="Ways to start"
              title={["WHAT ESTROC CAN", <span className="text-zinc-500">BUILD FOR YOU</span>]}
              copy="Start small with a feasibility test, or go straight to a full product."
              testId="vision-options"
            />
            <div className="mt-12 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4" data-testid="vision-options">
              {visionOptions.map((option, index) => (
                <div key={option.title} className="group relative flex flex-col bg-[#0a0a0b] p-6 transition-colors hover:bg-[#0d0d0f]">
                  <span className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-[#ff5500] transition-transform duration-500 group-hover:scale-x-100 group-focus-within:scale-x-100" aria-hidden="true" />
                  <p className="font-mono text-xs text-zinc-600">{String(index + 1).padStart(2, "0")}</p>
                  <h3 className="mt-5 text-xl font-semibold leading-tight tracking-[-0.03em] text-zinc-100">{option.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500">{option.copy}</p>
                  <button
                    type="button"
                    onClick={() => enquire(option.message)}
                    className={`mt-auto inline-flex items-center gap-2 self-start pt-8 text-sm font-medium text-zinc-100 underline-offset-4 transition-colors hover:text-[#ff5500] hover:underline ${focusRing}`}
                    data-testid={`vision-option-${index}`}
                  >
                    Discuss This Project
                    <ArrowUpRight className="h-4 w-4 text-[#ff5500]" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================= FINAL CTA ========================= */}

        {/* The enquiry form lives once, on the homepage; this hands the visitor to it. */}
        <section id="vision-final-cta" className="border-t border-white/[0.08]" data-testid="vision-final-cta-section">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
            <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr] lg:items-end lg:gap-20">
              <div>
                <MaskLines
                  as="h2"
                  lines={["HAVE A VISION AI IDEA?", <span className="text-zinc-500">LET'S BUILD IT.</span>]}
                  className="text-4xl font-semibold leading-[1.02] tracking-[-0.06em] text-zinc-100 sm:text-6xl"
                  testId="vision-final-heading"
                />
                <Rise delay={0.12}>
                  <p className="mt-6 max-w-lg text-lg leading-relaxed text-zinc-500">
                    Tell us what you want to detect, inspect, track or automate. We'll help you shape it into a practical solution.
                  </p>
                </Rise>
                <Rise delay={0.18} className="mt-8">
                  <Button type="button" size="lg" onClick={() => enquire()} className="px-4" data-testid="vision-final-discuss-button">
                    Discuss Your Project
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </Rise>
              </div>

              <Rise delay={0.24} className="border-t border-white/10 pt-4" testId="vision-contact-details">
                <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-zinc-600">Or reach us directly</p>
                <CopyEmail />
              </Rise>
            </div>
          </div>
        </section>

        <aside className="border-t border-white/[0.08]" aria-label="Disclaimer" data-testid="vision-disclaimer">
          <div className="mx-auto flex max-w-7xl gap-4 px-5 py-8 sm:px-8 lg:px-10">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#ff5500]" aria-hidden="true" />
            <p className="max-w-4xl text-xs leading-relaxed text-zinc-500">
              Projects, demos and figures on this page are illustrative concepts with simulated results, not completed client work. Real-world
              performance depends on your data, cameras and testing. Healthcare imaging tools are decision-support software and require clinical
              validation. This page uses no camera and uploads no images.
            </p>
          </div>
        </aside>
      </main>

      <SiteFooter />
      <Chatbot hidden={menuOpen} />
    </div>
  );
}
