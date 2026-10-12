/**
 * Copy for the Blockchain & Web3 page, kept apart from the layout so the
 * claims can be reviewed in one place. Two rules hold throughout: nothing here
 * is investment advice, and every token, address and history on the page is
 * fictional demonstration data, labelled as such where it is shown.
 */

export interface LedgerStep {
  title: string;
  short: string;
  copy: string;
  detail: string;
}

export const ledgerSteps: LedgerStep[] = [
  {
    title: "A transaction is initiated",
    short: "Initiate",
    copy: "Someone signs a transaction with their private key — a payment, a token transfer or a call to a smart contract — and broadcasts it to the network.",
    detail: "The signature proves the sender authorised it, without revealing the key itself.",
  },
  {
    title: "Participants validate it",
    short: "Validate",
    copy: "Nodes check the transaction against the network's rules: is the signature valid, does the sender hold the funds, has it been spent already?",
    detail: "Who gets to validate differs by network — anyone can run a node on a public chain; a permissioned network admits only approved members.",
  },
  {
    title: "It is grouped into a block",
    short: "Group",
    copy: "Valid transactions wait in a pool until a block producer bundles a batch of them into a new block, linked to the block before it by that block's cryptographic hash.",
    detail: "Changing any earlier transaction would change its block's hash and break every link after it — that is what makes the record tamper-evident.",
  },
  {
    title: "Consensus adds it to the ledger",
    short: "Commit",
    copy: "The network agrees, through its consensus mechanism, that the block is valid and in the right order. Every honest node then appends it to its copy of the ledger.",
    detail: "Some networks reach practical finality in seconds; others treat a block as settled once enough further blocks are built on top of it.",
  },
];

/** Consensus differs network to network — shown beside the step explainer. */
export const consensusModels: [name: string, copy: string][] = [
  ["Proof of work", "Miners spend computation to propose blocks. Used by Bitcoin."],
  ["Proof of stake", "Validators lock up the network's asset as collateral to propose and attest to blocks. Used by Ethereum since 2022."],
  ["Permissioned / BFT", "A known set of organisations validates or orders transactions. Common in enterprise and consortium networks."],
];

export type EcosystemId =
  | "bitcoin"
  | "ethereum"
  | "stablecoins"
  | "defi"
  | "nfts"
  | "smart-contracts"
  | "tokenization";

export interface EcosystemEntry {
  id: EcosystemId;
  tab: string;
  title: string;
  kicker: string;
  copy: string[];
  facts: [label: string, value: string][];
  useCases: string[];
  caveat: string;
}

export const ecosystem: EcosystemEntry[] = [
  {
    id: "bitcoin",
    tab: "Bitcoin",
    title: "Peer-to-peer digital currency",
    kicker: "Payments / settlement",
    copy: [
      "Bitcoin is a public network for sending value directly between parties, without a bank or payment processor in the middle. Its ledger is maintained by thousands of independent nodes.",
      "New blocks are secured by proof-of-work mining, and the protocol caps supply at 21 million coins. Its scripting language is deliberately limited, keeping the focus on transferring and holding value.",
    ],
    facts: [["Launched", "2009"], ["Consensus", "Proof of work"], ["Native asset", "BTC"]],
    useCases: ["Peer-to-peer value transfer", "Cross-border payments", "Payment channels such as the Lightning Network", "Timestamping and proof that a document existed"],
    caveat: "Its price can be highly volatile, and transaction fees and confirmation times rise with network demand.",
  },
  {
    id: "ethereum",
    tab: "Ethereum",
    title: "Programmable blockchain infrastructure",
    kicker: "Smart contracts / applications",
    copy: [
      "Ethereum runs a shared virtual machine — the EVM — where developers deploy smart contracts: programs that hold state and run when they are called.",
      "Tokens, lending protocols, NFT collections and whole applications are built on it, and layer-2 networks process transactions off the main chain before settling back to it for more capacity.",
    ],
    facts: [["Launched", "2015"], ["Consensus", "Proof of stake"], ["Native asset", "ETH"]],
    useCases: ["Smart-contract applications", "Token issuance (ERC-20, ERC-721, ERC-1155)", "DeFi protocols", "Layer-2 scaling networks"],
    caveat: "Every computation costs gas, so fees and contract efficiency are part of product design — not an afterthought.",
  },
  {
    id: "stablecoins",
    tab: "Cryptocurrencies & Stablecoins",
    title: "Different assets, different purposes",
    kicker: "Network assets / stable value",
    copy: [
      "Cryptocurrencies are the native assets of blockchain networks. Depending on the network they pay transaction fees, secure the chain through staking or mining, or carry governance rights — each is designed for its own network, not as a copy of Bitcoin.",
      "Stablecoins are tokens designed to track a reference asset, usually a fiat currency. Some are backed by reserves an issuer holds; others rely on on-chain collateral and automated mechanisms.",
    ],
    facts: [["Cryptocurrency", "Network utility"], ["Stablecoin", "Price stability"], ["Rules", "Vary by country"]],
    useCases: ["Paying network fees and staking", "On-chain settlement in a stable unit", "Cross-border transfers", "Programmable payouts and payroll"],
    caveat: "Cryptocurrency prices can swing sharply. Stablecoins carry issuer, reserve, de-pegging and regulatory risk — “stable” is a design goal, not a guarantee.",
  },
  {
    id: "defi",
    tab: "DeFi",
    title: "Financial applications built on blockchains",
    kicker: "Decentralised finance",
    copy: [
      "DeFi is the name for financial services — exchanges, lending markets, payments, asset management — built from smart contracts, so trades and loans are executed by code instead of an intermediary's back office.",
      "Positions are visible on-chain and protocols can be combined with one another, which is powerful and also means a failure in one can affect others.",
    ],
    facts: [["Runs on", "Smart contracts"], ["Access", "Wallet-based"], ["Custody", "Often self-held"]],
    useCases: ["Token swaps via automated market makers", "Collateralised lending and borrowing", "On-chain treasury management", "Streaming and scheduled payments"],
    caveat: "Smart-contract bugs, price-oracle failures and sudden liquidity shocks are real risks. Audits reduce them; they do not remove them.",
  },
  {
    id: "nfts",
    tab: "NFTs",
    title: "Unique tokens for unique things",
    kicker: "Non-fungible tokens",
    copy: [
      "A non-fungible token is a token with its own unique identifier. It can stand for a digital artwork, a game item, a membership, a ticket or a record about a physical asset.",
      "The blockchain records which address controls the token and its transfer history. What owning it actually means is set by the terms attached to it.",
    ],
    facts: [["Standards", "ERC-721 / 1155"], ["Each token", "Unique ID"], ["Rights", "Set by terms"]],
    useCases: ["Digital art and collectibles", "Membership and access passes", "Event ticketing", "Certificates and provenance records"],
    caveat: "Holding the token does not automatically grant copyright or legal title to what it points to — that depends on the licence and the law.",
  },
  {
    id: "smart-contracts",
    tab: "Smart Contracts",
    title: "Code that executes on defined conditions",
    kicker: "Programmable agreements",
    copy: [
      "Smart contracts are programs deployed to a blockchain that run exactly as written when called — releasing a payment once a condition is met, minting a token, or counting a vote.",
      "Deployed logic is usually hard or impossible to change, so specification, testing and independent review happen before launch, not after.",
    ],
    facts: [["Languages", "Solidity, Rust…"], ["Trigger", "A transaction"], ["Change", "Hard after deploy"]],
    useCases: ["Escrow and conditional payments", "Token and NFT minting", "Automated revenue splits and royalties", "Governance and voting"],
    caveat: "A contract only knows what is on-chain. Outside data — prices, weather, delivery status — arrives through oracles, which add their own trust assumptions.",
  },
  {
    id: "tokenization",
    tab: "Tokenization",
    title: "Digital representations of assets and rights",
    kicker: "Real-world and digital assets",
    copy: [
      "Tokenization represents an asset or a right — a fund unit, an invoice, loyalty points, a carbon credit, an interest in property — as tokens that can be issued, transferred and tracked on a ledger.",
      "The link between a token and the thing it represents is legal, not technical: it is defined in contracts, custody arrangements and regulation outside the chain.",
    ],
    facts: [["Represents", "Assets / rights"], ["Rules", "Coded transfer limits"], ["Backed by", "Legal structure"]],
    useCases: ["Fractional interests in real assets", "Tokenised funds and securities, where permitted", "Loyalty and reward points", "Invoice and trade finance"],
    caveat: "A token is only as sound as the legal structure, custody and compliance behind it.",
  },
];

export interface DemoAsset {
  id: string;
  category: string;
  name: string;
  standard: string;
  tokenId: string;
  contract: string;
  attributes: [label: string, value: string][];
  history: [event: string, party: string, date: string][];
  note: string;
}

/** Fictional throughout — the addresses are visibly placeholders, not real wallets. */
export const demoAssets: DemoAsset[] = [
  {
    id: "art",
    category: "Digital art & collectibles",
    name: "Signal Study No. 7",
    standard: "ERC-721",
    tokenId: "#0007",
    contract: "0xDEMO…A11E",
    attributes: [["Edition", "1 of 1"], ["Medium", "Generative SVG"], ["Royalty", "5% (illustrative)"]],
    history: [["Minted", "0xA1C3…demo", "12 Jan 2026"], ["Sold", "0x7F02…demo", "03 Mar 2026"], ["Transferred", "0x5B9E…demo", "21 Jun 2026"]],
    note: "Proves which address holds the token — not who owns the copyright.",
  },
  {
    id: "game",
    category: "Gaming assets",
    name: "Orbital Blade",
    standard: "ERC-1155",
    tokenId: "#4021 · qty 1",
    contract: "0xDEMO…6A3E",
    attributes: [["Rarity", "Rare"], ["Level", "12"], ["Usable in", "Demo Arena"]],
    history: [["Crafted", "0x91D0…demo", "02 Feb 2026"], ["Traded", "0x3C47…demo", "14 Apr 2026"], ["Equipped", "0x3C47…demo", "15 Apr 2026"]],
    note: "Works only in games that choose to read this contract.",
  },
  {
    id: "pass",
    category: "Membership & access passes",
    name: "Founders Circle Pass",
    standard: "ERC-721",
    tokenId: "#0138",
    contract: "0xDEMO…9A55",
    attributes: [["Tier", "Annual"], ["Valid until", "31 Dec 2026"], ["Grants", "Events, member portal"]],
    history: [["Issued", "0xE4A8…demo", "01 Jan 2026"], ["Renewed", "0xE4A8…demo", "01 Jul 2026"]],
    note: "The portal checks the wallet holds the pass before granting access.",
  },
  {
    id: "ticket",
    category: "Ticketing",
    name: "Build Summit — Day 2",
    standard: "ERC-721",
    tokenId: "#2290",
    contract: "0xDEMO…7C3E",
    attributes: [["Seat", "Hall B · Row 4"], ["Resale cap", "Face value"], ["Status", "Unused"]],
    history: [["Issued", "0x22F1…demo", "18 May 2026"], ["Resold", "0xB803…demo", "09 Aug 2026"]],
    note: "Transfer rules — like a resale price cap — can be written into the contract.",
  },
  {
    id: "certificate",
    category: "Certificates & provenance",
    name: "Batch Certificate — Coffee Lot 44",
    standard: "ERC-721 (non-transferable)",
    tokenId: "#0044",
    contract: "0xDEMO…CE27",
    attributes: [["Origin", "Estate (fictional)"], ["Harvest", "2026"], ["Inspected by", "Demo Lab"]],
    history: [["Issued", "0x6D2A…demo", "10 Apr 2026"], ["Shipment logged", "0x6D2A…demo", "02 May 2026"], ["Verified", "0x0E71…demo", "20 May 2026"]],
    note: "Records what the issuer attested — the inspection itself happens off-chain.",
  },
];

export interface UseCase {
  id: string;
  name: string;
  copy: string;
  workflow: string[];
  example: string;
  caveat: string;
}

export const useCases: UseCase[] = [
  {
    id: "finance",
    name: "Finance & Digital Assets",
    copy: "Ledgers that settle transfers and record ownership of digital assets, with issuance, permissions and compliance checks written into the system rather than reconciled afterwards.",
    workflow: ["Verify the customer", "Issue or receive the asset", "Transfer and settle on-chain", "Reconcile and report"],
    example: "An operations dashboard where a finance team issues, tracks and reconciles tokenised balances, with a compliance check before every transfer.",
    caveat: "Custody, licensing and reporting obligations still apply, and differ by jurisdiction.",
  },
  {
    id: "supply-chain",
    name: "Supply Chain & Provenance",
    copy: "Each party in a supply chain records its handoff to a shared ledger, so producer, shipper and buyer all see the same sequence of events instead of three versions of it.",
    workflow: ["Producer registers the batch", "Each handoff is signed and recorded", "Certificates are attached", "Buyer scans to view the history"],
    example: "A provenance portal where a buyer scans a QR code on a product and sees its batch's recorded journey and certificates.",
    caveat: "A ledger records what participants submit; it cannot prove the physical data was accurate. Sensors, audits and trusted inspectors still matter.",
  },
  {
    id: "identity",
    name: "Identity & Verification",
    copy: "An issuer signs a credential — a degree, a licence, a completed KYC check. The holder presents it, and anyone can verify the signature and whether it has been revoked, without calling the issuer every time.",
    workflow: ["Issuer signs the credential", "Holder keeps it in a wallet", "Holder presents a proof", "Verifier checks signature and status"],
    example: "A certificate-verification portal for an institution, with a public revocation registry and personal data kept off-chain.",
    caveat: "Personal data generally belongs off-chain. Privacy law — GDPR, India's DPDP Act and others — shapes the design from day one.",
  },
  {
    id: "energy",
    name: "Energy & Trading Platforms",
    copy: "Blockchain can give energy market participants a shared, tamper-evident record of transactions — metered generation submitted by participants, trades matched on a platform, renewable-energy certificates — and automate the settlement between them.",
    workflow: ["Participants submit meter data", "The platform matches offers", "Trades are recorded on the ledger", "Settlement and certificates are tracked"],
    example: "A peer-to-peer trading pilot where registered rooftop-solar owners and neighbours trade surplus, with each trade recorded and settled in credits.",
    caveat: "Blockchain records transactions; it does not move electricity. Physical delivery stays with the grid operator, the platform still works within utility and market regulation, and records are only as reliable as the metering data behind them.",
  },
  {
    id: "tokenization",
    name: "Tokenization",
    copy: "An asset or right is represented as tokens that can be issued, distributed and transferred under coded rules — for example, only to verified holders, or only after a lock-up period.",
    workflow: ["Structure the asset legally", "Issue tokens with transfer rules", "Onboard and distribute to holders", "Run payouts, transfers and redemption"],
    example: "A platform for fractional interests in a property fund, where tokens can only move between investors who have passed verification.",
    caveat: "Securities and asset laws apply. Tokenization is a legal and regulatory project as much as a technical one.",
  },
  {
    id: "enterprise",
    name: "Enterprise Applications",
    copy: "Permissioned networks let a known group of organisations share one ledger with access controls — for inter-company reconciliation, shared audit trails and multi-party workflows.",
    workflow: ["Members agree the rules", "Each member runs a node", "Shared transactions are recorded once", "Audit and reconcile from one record"],
    example: "A reconciliation ledger where trading partners record shared invoices once, instead of each reconciling its own database against the others'.",
    caveat: "Many problems are better served by a conventional database. A ledger earns its place when several parties need a shared record that none of them controls alone.",
  },
];

export interface Web3Service {
  title: string;
  problem: string;
  build: string;
}

export const web3Services: Web3Service[] = [
  {
    title: "Custom blockchain applications",
    problem: "Several organisations reconcile separate records by hand and still disagree about what happened.",
    build: "Applications on public or permissioned networks, with the chain chosen for the problem — or a plain database recommended where that serves better.",
  },
  {
    title: "Smart contract development",
    problem: "Agreements, payouts or access rules depend on manual checks and slow intermediaries.",
    build: "Specified, tested and documented contracts with deliberate decisions on upgrades and access control, prepared for independent audit.",
  },
  {
    title: "Web3 websites & dApps",
    problem: "A product works on-chain, but ordinary users find it confusing or unsafe to use.",
    build: "Fast, accessible interfaces that read chain data clearly and explain every signature before a user approves it.",
  },
  {
    title: "NFT & tokenization platforms",
    problem: "Memberships, tickets, certificates or asset interests are hard to issue, transfer and verify.",
    build: "Issuance, management and verification platforms with transfer rules matched to the use case and its legal terms.",
  },
  {
    title: "Wallet integrations",
    problem: "Users drop off at connect-wallet screens, wrong networks and transaction prompts they don't understand.",
    build: "Wallet connection, network handling and readable transaction prompts — designed so private keys stay with the user.",
  },
  {
    title: "Blockchain APIs & dashboards",
    problem: "On-chain data is public, but scattered, raw and hard to report on.",
    build: "Indexers, APIs and dashboards that turn contract events into the reports and alerts a business actually uses.",
  },
  {
    title: "Digital asset platforms",
    problem: "Issuing and administering digital assets needs roles, controls and an audit trail.",
    build: "Admin consoles, issuance tools and reporting, built around the compliance requirements you define with your advisers.",
  },
  {
    title: "Energy technology solutions",
    problem: "Metering data, trades and certificates live in disconnected systems.",
    build: "Energy-data dashboards, trading-platform interfaces and certificate tracking — with a ledger where it adds value, without one where it doesn't.",
  },
];

export const web3Process: [stage: string, copy: string][] = [
  ["Discover", "The problem, the parties involved, and whether a blockchain is the right tool at all."],
  ["Define", "Network choice, token and contract model, compliance needs and scope."],
  ["Design", "Product flows, wallet and signing experience, system architecture."],
  ["Engineer", "Contracts, backend, indexing and the interface, built in reviewable steps."],
  ["Test", "Unit and integration tests, testnet deployments, preparation for external audit."],
  ["Launch", "Mainnet deployment, monitoring, documentation and ongoing support."],
];
