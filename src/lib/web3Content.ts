/**
 * Copy for the Blockchain & Web3 services page, kept apart from the layout so
 * the claims can be reviewed in one place. Everything here describes what
 * ESTROC can build — capabilities and possible solutions, not delivered client
 * work — and nothing here is financial or investment advice.
 */

/** The only "what is it" content on the page: three lines, then on to services. */
export const web3Basics: [title: string, copy: string][] = [
  ["Shared records", "Several parties work from one tamper-evident record instead of reconciling separate copies."],
  ["Programmable rules", "Smart contracts run agreed business logic — payments, approvals, transfers — when conditions are met."],
  ["Verifiable ownership", "Tokens show who holds an asset, pass or certificate, and how it changed hands."],
];

export interface Web3Service {
  id: string;
  title: string;
  problem: string;
  builds: [string, string, string];
  example: string;
}

export const web3Services: Web3Service[] = [
  {
    id: "applications",
    title: "Blockchain Application Development",
    problem: "Several parties keep separate records of the same transactions and lose time reconciling who did what.",
    builds: [
      "Custom blockchain-based applications",
      "Business workflows built on verifiable records and transactions",
      "Integration with your existing products and systems",
    ],
    example: "A distributor and its retailers share one tamper-evident record of stock transfers, viewed through a web portal each party signs in to.",
  },
  {
    id: "smart-contracts",
    title: "Smart Contract Development",
    problem: "Payments, approvals or releases wait on manual checks and back-and-forth between parties.",
    builds: [
      "Business rules encoded into smart contracts",
      "Automated transaction and approval workflows",
      "Contract integration, testing and deployment support",
    ],
    example: "A milestone-payment workflow where funds held by a contract are released once both client and supplier approve the delivered work.",
  },
  {
    id: "dapps",
    title: "Web3 Platforms & dApps",
    problem: "An on-chain product exists, but users find wallets, networks and transaction signing confusing.",
    builds: [
      "Decentralized application interfaces",
      "Blockchain-connected web applications",
      "Wallet and network integrations where appropriate",
    ],
    example: "A members' portal where users connect a wallet to view their holdings and claim benefits, with a plain-language summary before every signature.",
  },
  {
    id: "nfts",
    title: "NFTs & Digital Ownership",
    problem: "Memberships, tickets and certificates are hard to issue, transfer and check for authenticity.",
    builds: [
      "NFT minting platforms and marketplaces",
      "Digital asset ownership and verification",
      "Memberships, access passes, collectibles and certificates",
    ],
    example: "A training provider issues course certificates as non-transferable tokens that employers verify on a public lookup page.",
  },
  {
    id: "tokenization",
    title: "Tokenization & Digital Assets",
    problem: "Ownership of an asset lives in spreadsheets and paperwork, so transfers and reporting are slow.",
    builds: [
      "Token-based representations of eligible digital or real-world assets",
      "Asset lifecycle and ownership-record workflows",
      "Business-specific tokenization prototypes and platforms",
    ],
    example: "A prototype representing fractional interests in an eligible asset, with transfers limited to verified participants — structured alongside the client's legal advisers.",
  },
  {
    id: "integrations",
    title: "Blockchain Integrations",
    problem: "On-chain activity is invisible to the CRM, ERP and reporting tools the business actually runs on.",
    builds: [
      "Connecting blockchain networks to existing applications",
      "APIs, data services and transaction monitoring",
      "Integration with databases, dashboards and business systems",
    ],
    example: "A monitoring service that watches a company's contracts and pushes payments and events into its existing dashboard and accounting exports.",
  },
];

export interface Application {
  id: string;
  name: string;
  challenge: string;
  solution: string;
  deliverables: string[];
  note?: string;
}

export const applications: Application[] = [
  {
    id: "commerce",
    name: "Digital Commerce",
    challenge: "Brands want loyalty, access and digital products that customers can genuinely own, transfer or redeem.",
    solution: "NFT-based memberships, digital collectibles and token-enabled rewards tied to real benefits.",
    deliverables: ["Minting and claim flows", "Holder-only content and perks", "Admin dashboard for drops and redemptions"],
  },
  {
    id: "supply-chain",
    name: "Supply Chain & Traceability",
    challenge: "Buyers and auditors struggle to confirm where a product came from and who handled it along the way.",
    solution: "Each handoff is recorded to a shared, tamper-evident ledger, with certificates attached to each batch.",
    deliverables: ["Batch registration and handoff app", "QR-based product journey page", "Partner and auditor portals"],
    note: "A ledger records what participants submit. Inspections, sensors and trusted parties still verify the physical facts.",
  },
  {
    id: "energy",
    name: "Energy & Sustainability",
    challenge: "Energy trades, meter data and renewable-energy certificates sit in separate systems, which slows settlement and makes traceability hard.",
    solution: "Software that keeps a shared record of trades and certificates and supports settlement workflows between participants.",
    deliverables: ["Trading-record and settlement dashboard", "Renewable-energy certificate tracking", "Metering and operator system integrations"],
    note: "Blockchain doesn't generate or deliver electricity. Any platform operates within the relevant market structure, its integrations with grid and metering systems, and energy regulation.",
  },
  {
    id: "finance",
    name: "Finance & Asset Workflows",
    challenge: "Multi-step transactions involve manual approvals, reconciliation and fragmented ownership records.",
    solution: "Programmable transaction workflows and, for eligible assets, token-based ownership records.",
    deliverables: ["Approval and settlement workflows", "Asset issuance and holder registers", "Reporting and reconciliation exports"],
    note: "Licensing, custody and securities rules vary by jurisdiction and are addressed with your legal and compliance advisers.",
  },
  {
    id: "identity",
    name: "Identity & Verification",
    challenge: "Certificates and documents are easy to forge and slow to verify, often needing a call to the issuer.",
    solution: "Issuers sign verifiable credentials, and anyone permitted can check authenticity and revocation status instantly.",
    deliverables: ["Credential issuance console", "Public verification page", "Revocation and audit registry"],
    note: "Personal data is generally kept off-chain, and privacy law shapes the design from the start.",
  },
  {
    id: "enterprise",
    name: "Enterprise Operations",
    challenge: "Departments or partner companies need one audit trail that none of them controls alone.",
    solution: "A permissioned ledger that records shared events and automates multi-party workflow rules.",
    deliverables: ["Multi-party workflow application", "Audit-trail viewer", "ERP and database connectors"],
    note: "Where a single organisation owns the data, a conventional database is often the better choice — and we'll tell you so.",
  },
];

export interface Concept {
  id: "nft" | "workflow" | "energy";
  name: string;
  summary: string;
  deliverables: string[];
}

export const concepts: Concept[] = [
  {
    id: "nft",
    name: "NFT Platform",
    summary: "Digital asset minting, ownership views and marketplace functionality.",
    deliverables: ["Minting and collection management", "Owner profiles and asset pages", "Listings, offers and transfers", "Admin and royalty settings"],
  },
  {
    id: "workflow",
    name: "Smart Contract Workflow",
    summary: "Contract-driven transactions, status tracking and an administration dashboard.",
    deliverables: ["Tested contract logic, ready for audit", "Milestone and approval tracking", "Role-based admin dashboard", "Notifications and exports"],
  },
  {
    id: "energy",
    name: "Energy Traceability Platform",
    summary: "Renewable-energy records, certificate tracking and transaction history.",
    deliverables: ["Generation and trade records", "Certificate issuance and retirement", "Transaction history and audit view", "Metering and operator integrations"],
  },
];
