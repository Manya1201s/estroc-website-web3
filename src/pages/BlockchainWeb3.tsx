import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import Chatbot from "@/components/estroc/Chatbot";
import CopyEmail from "@/components/estroc/CopyEmail";
import Grain from "@/components/estroc/Grain";
import { MaskLines, Rise } from "@/components/estroc/MaskReveal";
import { SiteFooter, SiteHeader, useOpenEnquiry } from "@/components/estroc/SiteChrome";
import ChainVisual from "@/components/estroc/web3/ChainVisual";
import ProjectConcepts from "@/components/estroc/web3/ProjectConcepts";
import ServiceCards from "@/components/estroc/web3/ServiceCards";
import UseCaseExplorer from "@/components/estroc/web3/UseCaseExplorer";
import { SectionIntro } from "@/components/estroc/web3/shared";
import { web3Basics } from "@/lib/web3Content";
import { useScrollTo } from "@/lib/smoothScroll";

const BLOCKCHAIN_INTEREST = "Blockchain / Web3";

const meta = {
  title: "Blockchain & Web3 Development — ESTROC",
  description:
    "ESTROC designs and develops blockchain applications, smart contracts, Web3 platforms, NFT and tokenization solutions and blockchain integrations for businesses.",
};

/** Swaps the document head for this page and puts the homepage's back on the way out. */
function usePageMeta() {
  useEffect(() => {
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const previous = { title: document.title, description: description?.content, canonical: canonical?.href };

    document.title = meta.title;
    if (description) description.content = meta.description;
    if (canonical) canonical.href = "https://estroc.co.in/blockchain-web3";

    return () => {
      document.title = previous.title;
      if (description && previous.description) description.content = previous.description;
      if (canonical && previous.canonical) canonical.href = previous.canonical;
    };
  }, []);
}

export default function BlockchainWeb3() {
  const [menuOpen, setMenuOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const scrollToId = useScrollTo();
  const openEnquiry = useOpenEnquiry();
  const heroRef = useRef<HTMLElement>(null);

  usePageMeta();

  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroProgress, [0, 1], ["0%", "-14%"]);
  const heroOpacity = useTransform(heroProgress, [0, 0.75], [1, 0]);

  /**
   * Every CTA opens the homepage enquiry form with Blockchain / Web3 ticked. A
   * message is only seeded when the visitor hasn't written one (ProjectForm).
   */
  const enquire = (message?: string) => openEnquiry({ interest: BLOCKCHAIN_INTEREST, message });
  const discussTopic = (topic: string) => enquire(`I'd like to discuss a project involving ${topic.toLowerCase()}.`);

  return (
    <div
      className="min-h-screen overflow-x-clip bg-[#0a0a0b] text-[#f5f5f7] selection:bg-[#ff5500] selection:text-[#0a0a0b]"
      data-testid="blockchain-web3-page"
    >
      <Toaster position="bottom-left" richColors />
      <Grain />
      <SiteHeader menuOpen={menuOpen} onMenuOpenChange={setMenuOpen} />

      <main id="top">
        {/* ========================= HERO ========================= */}

        <section
          ref={heroRef}
          className="relative mx-auto grid min-h-screen max-w-7xl content-center items-center gap-y-12 px-5 pb-20 pt-32 [--hero-type:clamp(2.9rem,5.6vw,5.4rem)] sm:px-8 lg:grid-cols-[1fr_1fr] lg:gap-x-12 lg:px-10 lg:pb-16 lg:pt-28"
          data-testid="web3-hero-section"
        >
          <motion.div style={reducedMotion ? undefined : { y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-xl">
            <Rise immediate className="mb-5">
              <p className="text-xs font-mono uppercase tracking-[0.24em] text-[#ff5500] sm:text-sm">Blockchain &amp; Web3 development</p>
            </Rise>

            <MaskLines
              as="h1"
              immediate
              delay={0.12}
              lines={["BLOCKCHAIN", "SOLUTIONS.", <span className="text-zinc-500">BUILT FOR</span>, <span className="text-zinc-500">REAL BUSINESS.</span>]}
              className="text-[length:var(--hero-type)] font-bold leading-[0.92] tracking-[-0.08em] text-zinc-100"
              testId="web3-hero-heading"
            />

            <Rise immediate delay={0.5} className="mt-8">
              <p className="max-w-lg text-base leading-relaxed text-zinc-400 sm:text-lg" data-testid="web3-hero-copy">
                ESTROC designs and develops blockchain applications, smart contracts and Web3 products that help businesses build
                transparent, programmable and verifiable digital systems.
              </p>
            </Rise>

            <Rise immediate delay={0.6} className="mt-9 flex flex-wrap gap-3">
              <Button type="button" size="lg" onClick={() => enquire()} className="px-4" data-testid="web3-hero-discuss-button">
                Discuss Your Project
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button type="button" size="lg" variant="outline" onClick={() => scrollToId("capabilities")} className="px-4" data-testid="web3-hero-capabilities-button">
                Explore Our Capabilities
                <ArrowDown className="ml-2 h-4 w-4" />
              </Button>
            </Rise>
          </motion.div>

          <div className="relative">
            <ChainVisual scrollProgress={heroProgress} />
            <div className="mt-2 flex justify-between text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-600" data-testid="web3-hero-caption">
              <span>Example architecture / illustrative</span>
              <span className="hidden sm:block">Ledger · contracts · APIs · apps</span>
            </div>
          </div>
        </section>

        {/* ========================= IN SHORT ========================= */}

        <section className="border-t border-white/[0.08] bg-[#0d0d0f]" aria-labelledby="web3-basics-title" data-testid="web3-basics-section">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[0.8fr_repeat(3,1fr)] lg:gap-10 lg:px-10">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#ff5500]">In short</p>
              <p id="web3-basics-title" className="mt-3 text-lg font-medium leading-snug tracking-tight text-zinc-100">
                Why businesses use blockchain
              </p>
            </div>
            {web3Basics.map(([title, copy], index) => (
              <Rise key={title} delay={index * 0.06}>
                <p className="text-sm font-medium text-zinc-200">{title}</p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{copy}</p>
              </Rise>
            ))}
          </div>
        </section>

        {/* ========================= WHAT WE CAN BUILD ========================= */}

        <section id="capabilities" className="border-t border-white/[0.08]" data-testid="web3-services-section">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
            <SectionIntro
              index="01"
              kicker="What we can build"
              title={["WHAT ESTROC", <span className="text-zinc-500">CAN BUILD</span>]}
              copy="Six ways we help businesses put blockchain to work — each starting from a real business problem, not a token."
              testId="web3-services"
            />
            <ServiceCards onDiscuss={discussTopic} />
          </div>
        </section>

        {/* ========================= INDUSTRY APPLICATIONS ========================= */}

        <section id="applications" className="border-t border-white/[0.08]" data-testid="web3-applications-section">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
            <SectionIntro
              index="02"
              kicker="Industry & business applications"
              title={["WHERE IT", <span className="text-zinc-500">MAKES SENSE</span>]}
              copy="Choose an industry to see the challenge, a blockchain-based approach, and what ESTROC could develop for it."
              testId="web3-applications"
            />
            <UseCaseExplorer onDiscuss={discussTopic} />
          </div>
        </section>

        {/* ========================= CONCEPTS ========================= */}

        <section id="concepts" className="border-t border-white/[0.08]" data-testid="web3-concepts-section">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
            <SectionIntro
              index="03"
              kicker="Possible solutions"
              title={["WHAT YOUR PROJECT", <span className="text-zinc-500">COULD LOOK LIKE</span>]}
              copy="Three hypothetical concepts showing the kind of product a blockchain project can become. Illustrative only — not client work."
              testId="web3-concepts"
            />
            <ProjectConcepts onDiscuss={discussTopic} />
          </div>
        </section>

        {/* ========================= FINAL CTA ========================= */}

        {/* The enquiry form lives once, on the homepage; this hands the visitor to it. */}
        <section id="web3-final-cta" className="border-t border-white/[0.08]" data-testid="web3-final-cta-section">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
            <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr] lg:items-end lg:gap-20">
              <div>
                <MaskLines
                  as="h2"
                  lines={["HAVE A BLOCKCHAIN IDEA?", <span className="text-zinc-500">LET'S BUILD THE</span>, <span className="text-zinc-500">RIGHT SOLUTION.</span>]}
                  className="text-4xl font-semibold leading-[1.02] tracking-[-0.06em] text-zinc-100 sm:text-6xl"
                  testId="web3-final-heading"
                />
                <Rise delay={0.12}>
                  <p className="mt-6 max-w-lg text-lg leading-relaxed text-zinc-500">
                    Tell us what you want to achieve. ESTROC can help evaluate the use case, define the scope and plan a practical development approach.
                  </p>
                </Rise>
                <Rise delay={0.18} className="mt-8">
                  <Button type="button" size="lg" onClick={() => enquire()} className="px-4" data-testid="web3-final-discuss-button">
                    Discuss a Project
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Rise>
              </div>

              <Rise delay={0.24} className="border-t border-white/10 pt-4" testId="web3-contact-details">
                <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-zinc-600">Or reach us directly</p>
                <CopyEmail />
              </Rise>
            </div>
          </div>
        </section>

        <aside className="border-t border-white/[0.08]" aria-label="Disclaimer" data-testid="web3-disclaimer">
          <div className="mx-auto flex max-w-7xl gap-4 px-5 py-8 sm:px-8 lg:px-10">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#ff5500]" aria-hidden="true" />
            <p className="max-w-4xl text-xs leading-relaxed text-zinc-500">
              The services, examples and concepts on this page describe what ESTROC can develop; they are not completed client projects.
              Nothing here is financial, investment or legal advice, and this page does not connect to wallets or request private keys.
            </p>
          </div>
        </aside>
      </main>

      <SiteFooter />
      <Chatbot hidden={menuOpen} />
    </div>
  );
}
