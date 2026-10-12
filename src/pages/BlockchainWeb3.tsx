import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import Chatbot from "@/components/estroc/Chatbot";
import CopyEmail from "@/components/estroc/CopyEmail";
import EditorialStatement from "@/components/estroc/EditorialStatement";
import Grain from "@/components/estroc/Grain";
import { MaskLines, Rise } from "@/components/estroc/MaskReveal";
import ProjectForm from "@/components/estroc/ProjectForm";
import type { ProjectFormPrefill } from "@/components/estroc/ProjectForm";
import { SiteFooter, SiteHeader } from "@/components/estroc/SiteChrome";
import AssetShowcase from "@/components/estroc/web3/AssetShowcase";
import ChainVisual from "@/components/estroc/web3/ChainVisual";
import EcosystemExplorer from "@/components/estroc/web3/EcosystemExplorer";
import LedgerExplainer from "@/components/estroc/web3/LedgerExplainer";
import UseCaseExplorer from "@/components/estroc/web3/UseCaseExplorer";
import { SectionIntro, focusRing } from "@/components/estroc/web3/shared";
import { web3Process, web3Services } from "@/lib/web3Content";
import { useScrollTo } from "@/lib/smoothScroll";

const BLOCKCHAIN_INTEREST = "Blockchain / Web3";

const meta = {
  title: "Blockchain & Web3 — ESTROC",
  description:
    "Explore blockchain, digital assets and decentralized technologies — and what businesses can build with them. Smart contracts, dApps, tokenization and more from ESTROC.",
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
  const [prefill, setPrefill] = useState<ProjectFormPrefill>();
  const reducedMotion = useReducedMotion();
  const scrollToId = useScrollTo();
  const heroRef = useRef<HTMLElement>(null);

  usePageMeta();

  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroProgress, [0, 1], ["0%", "-14%"]);
  const heroOpacity = useTransform(heroProgress, [0, 0.75], [1, 0]);

  /** Every "discuss" button lands on the one enquiry form, with the topic pre-noted. */
  const discuss = (topic?: string) => {
    setPrefill({
      key: Date.now(),
      interest: BLOCKCHAIN_INTEREST,
      message: topic ? `I'd like to discuss a project involving ${topic.toLowerCase()}.` : undefined,
    });
    scrollToId("start-a-project");
  };

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
          className="relative mx-auto grid min-h-screen max-w-7xl content-center items-center gap-y-12 px-5 pb-20 pt-32 [--hero-type:clamp(3.2rem,6.6vw,6.2rem)] sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-x-12 lg:px-10 lg:pb-16 lg:pt-28"
          data-testid="web3-hero-section"
        >
          <motion.div style={reducedMotion ? undefined : { y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-xl">
            <Rise immediate className="mb-5">
              <p className="text-xs font-mono uppercase tracking-[0.24em] text-[#ff5500] sm:text-sm">Blockchain &amp; Web3</p>
            </Rise>

            <MaskLines
              as="h1"
              immediate
              delay={0.12}
              lines={["BEYOND", "DIGITAL.", <span className="text-zinc-500">BUILT ON</span>, <span className="text-zinc-500">TRUST.</span>]}
              className="text-[length:var(--hero-type)] font-bold leading-[0.9] tracking-[-0.085em] text-zinc-100"
              testId="web3-hero-heading"
            />

            <Rise immediate delay={0.5} className="mt-8">
              <p className="max-w-md text-base leading-relaxed text-zinc-400 sm:text-lg" data-testid="web3-hero-copy">
                Explore blockchain, digital assets and decentralized technologies — and discover what businesses can build with them.
              </p>
            </Rise>

            <Rise immediate delay={0.6} className="mt-9 flex flex-wrap gap-3">
              <Button type="button" onClick={() => scrollToId("ecosystem")} data-testid="web3-hero-explore-button">
                Explore the Ecosystem
                <ArrowDown className="ml-2 h-4 w-4" />
              </Button>
              <Button type="button" variant="outline" onClick={() => scrollToId("build-with-estroc")} data-testid="web3-hero-build-button">
                Build with ESTROC
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Rise>
          </motion.div>

          <div className="relative">
            <ChainVisual scrollProgress={heroProgress} />
            <div className="mt-2 flex justify-between text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-600" data-testid="web3-hero-caption">
              <span>Illustrative ledger / simulated data</span>
              <span className="hidden sm:block">Not a live network</span>
            </div>
          </div>
        </section>

        {/* ========================= 02 UNDERSTAND ========================= */}

        <section id="understand" className="border-t border-white/[0.08]" data-testid="web3-understand-section">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
            <SectionIntro
              index="01"
              kicker="Understand"
              title={["HOW A BLOCKCHAIN", <span className="text-zinc-500">RECORDS A CHANGE</span>]}
              copy="Four steps from a signed transaction to a permanent entry in a shared ledger. Step through them — the details change from network to network."
              testId="web3-understand"
            />
            <LedgerExplainer />
          </div>
        </section>

        {/* ========================= 03 ECOSYSTEM ========================= */}

        <section id="ecosystem" className="border-t border-white/[0.08]" data-testid="web3-ecosystem-section">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
            <SectionIntro
              index="02"
              kicker="Ecosystem"
              title={["EXPLORE THE", <span className="text-zinc-500">ECOSYSTEM</span>]}
              copy="The networks, assets and building blocks that make up Web3 — what each one is for, where it is used, and what to watch for."
              testId="web3-ecosystem"
            />
            <EcosystemExplorer />
          </div>
        </section>

        {/* ========================= 04 DIGITAL OWNERSHIP ========================= */}

        <section id="digital-ownership" className="border-t border-white/[0.08]" data-testid="web3-ownership-section">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
            <SectionIntro
              index="03"
              kicker="NFTs & digital ownership"
              title={["ONE TOKEN.", <span className="text-zinc-500">ONE RECORD.</span>]}
              copy="NFTs are not only art. The same idea — a unique token with a public history — can carry a game item, a membership, a ticket or a certificate."
              testId="web3-ownership"
            />
            <AssetShowcase />
          </div>
        </section>

        {/* ========================= 05 APPLICATIONS ========================= */}

        <section id="applications" className="border-t border-white/[0.08]" data-testid="web3-applications-section">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
            <SectionIntro
              index="04"
              kicker="Real-world applications"
              title={["WHERE IT", <span className="text-zinc-500">EARNS ITS PLACE</span>]}
              copy="Blockchain is useful where several parties need one record that none of them controls alone. Choose an area to see how a system typically works."
              testId="web3-applications"
            />
            <UseCaseExplorer />
          </div>
        </section>

        <EditorialStatement
          lines={["A LEDGER IS ONLY", "AS USEFUL AS", <span className="text-zinc-500">THE PRODUCT ON TOP.</span>]}
          footnote="We build the product — and tell you plainly when a chain isn't needed."
          testId="web3-editorial-statement"
        />

        {/* ========================= 06 SERVICES ========================= */}

        <section id="web3-services" className="border-t border-white/[0.08]" data-testid="web3-services-section">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
            <SectionIntro
              index="05"
              kicker="Services"
              title={["WHAT ESTROC", <span className="text-zinc-500">CAN BUILD</span>]}
              copy="Each starts from a business problem, not a token. These are the kinds of systems we design and engineer."
              testId="web3-services"
            />

            <div className="mt-12 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 xl:grid-cols-4">
              {web3Services.map((service, index) => (
                <div key={service.title} className="group relative flex flex-col bg-[#0a0a0b]">
                  <span className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-[#ff5500] transition-transform duration-500 group-hover:scale-x-100 group-focus-within:scale-x-100" aria-hidden="true" />
                  {/* Only the contents fade in; the card face stays solid so the grid lines never flash. */}
                  <Rise delay={(index % 4) * 0.06} className="flex flex-1 flex-col p-6 sm:p-7">
                  <p className="font-mono text-xs text-zinc-600">{String(index + 1).padStart(2, "0")}</p>
                  <h3 className="mt-5 text-xl font-semibold leading-tight tracking-[-0.03em] text-zinc-100" data-testid={`web3-service-${index + 1}-title`}>
                    {service.title}
                  </h3>

                  <p className="mt-6 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-600">The problem</p>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{service.problem}</p>

                  <p className="mt-5 text-[10px] font-mono uppercase tracking-[0.2em] text-[#ff5500]/80">What we build</p>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-300">{service.build}</p>

                  <button
                    type="button"
                    onClick={() => discuss(service.title)}
                    className={`mt-auto inline-flex items-center gap-2 self-start pt-8 text-sm text-zinc-200 underline-offset-4 transition-colors hover:text-[#ff5500] hover:underline ${focusRing}`}
                    data-testid={`web3-service-${index + 1}-discuss-button`}
                  >
                    Discuss a Project
                    <ArrowUpRight className="h-4 w-4 text-[#ff5500]" />
                  </button>
                  </Rise>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================= 07 BUILD WITH ESTROC ========================= */}

        <section id="build-with-estroc" className="border-t border-white/[0.08] bg-[#0d0d0f]" data-testid="web3-build-section">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
            <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#ff5500]">06 / Build with ESTROC</p>
            <MaskLines
              as="h2"
              lines={["FROM BLOCKCHAIN IDEAS", <span className="text-zinc-500">TO WORKING PRODUCTS.</span>]}
              className="mt-4 max-w-5xl text-[clamp(2.4rem,5.6vw,5rem)] font-semibold leading-[1.02] tracking-[-0.06em] text-zinc-100"
              testId="web3-build-heading"
            />

            <ol className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-6 lg:gap-x-0" data-testid="web3-process">
              {web3Process.map(([stage, copy], index) => (
                <li key={stage} className="relative lg:pr-6">
                  <Rise delay={index * 0.07}>
                    <div className="flex items-center gap-3">
                      <span className="h-[11px] w-[11px] shrink-0 rounded-full bg-[#ff5500] shadow-[0_0_14px_rgba(255,85,0,0.45)]" aria-hidden="true" />
                      <span className="h-px flex-1 bg-white/10" aria-hidden="true" />
                      <ArrowRight className={`hidden h-3.5 w-3.5 lg:block ${index < web3Process.length - 1 ? "text-zinc-700" : "invisible"}`} aria-hidden="true" />
                    </div>
                    <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">{String(index + 1).padStart(2, "0")}</p>
                    <h3 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-zinc-100">{stage}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-500">{copy}</p>
                  </Rise>
                </li>
              ))}
            </ol>

            <Rise delay={0.15} className="mt-14">
              <Button
                type="button"
                onClick={() => discuss()}
                className="h-auto px-6 py-4 text-sm tracking-[0.06em] whitespace-normal"
                data-testid="web3-discuss-project-button"
              >
                LET'S DISCUSS YOUR BLOCKCHAIN PROJECT
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </Rise>
          </div>
        </section>

        {/* ========================= FINAL CTA + ENQUIRY ========================= */}

        <section id="start-a-project" className="border-t border-white/[0.08]" data-testid="start-project-section">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
              <div>
                <MaskLines
                  as="h2"
                  lines={["READY TO BUILD", <span className="text-zinc-500">WHAT'S NEXT?</span>]}
                  className="text-5xl font-semibold tracking-[-0.065em] text-zinc-100 sm:text-7xl"
                  testId="web3-final-heading"
                />
                <Rise delay={0.12}>
                  <p className="mt-5 max-w-md text-lg leading-relaxed text-zinc-500">
                    Tell us about the product, the people who will use it and the problem it solves. We'll come back with an honest view on the right technology.
                  </p>
                </Rise>

                <Rise delay={0.2} className="mt-10 border-t border-white/10 pt-4" testId="web3-contact-details">
                  <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-zinc-600">Or reach us directly</p>
                  <CopyEmail />
                </Rise>
              </div>

              <ProjectForm prefill={prefill} />
            </div>
          </div>
        </section>

        <aside className="border-t border-white/[0.08]" aria-label="Disclaimer" data-testid="web3-disclaimer">
          <div className="mx-auto flex max-w-7xl gap-4 px-5 py-8 sm:px-8 lg:px-10">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#ff5500]" aria-hidden="true" />
            <p className="max-w-4xl text-xs leading-relaxed text-zinc-500">
              This page is an educational overview, not financial, investment or legal advice. Token IDs, addresses, blocks and ownership
              histories shown here are fictional demonstration data. Nothing on this page connects to a wallet, asks for private keys or
              initiates a transaction.
            </p>
          </div>
        </aside>
      </main>

      <SiteFooter />
      <Chatbot hidden={menuOpen} />
    </div>
  );
}
