<div align="center">
  <h1>🛡️ ZKRx Platform 🛡️</h1>
  
  <p align="center">
    <strong>A Zero-Knowledge Pharmaceutical Verification Platform built on the Midnight Blockchain.</strong>
  </p>
  
  [![CI/CD Status](https://github.com/SimpleCoder26/ZKRx/actions/workflows/ci.yml/badge.svg)](https://github.com/SimpleCoder26/ZKRx/actions)
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![Midnight Blockchain](https://img.shields.io/badge/Network-Midnight_Preprod-558763.svg)](https://midnight.network/)
  [![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
  [![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED.svg)](https://www.docker.com/)

  *Secure the Source. Verify the Journey. Prove drug authenticity without exposing private manufacturing secrets.*

</div>

---

## 🔗 SUBMISSION DETAILS & QUICK LINKS

*   **🌐 Network**: Midnight Preprod Testnet
*   **💻 GitHub Repository**: [SimpleCoder26/ZKRx](https://github.com/SimpleCoder26/ZKRx)
*   **🔗 Live Demo**: [zkrx.vercel.app](https://zkrx.vercel.app/)
*   **🎬 Demo Video**: [youtu.be/tnvLooVmSYw](https://youtu.be/tnvLooVmSYw)
*   **📝 Product Proposal**: [View Approved Idea Document](./PROPOSAL.md)
*   **🐦 Product X Profile**: [https://x.com/ZKRxPlatform](https://x.com/ZKRxPlatform)
*   **⚙️ Smart Contract Source**: [`zkrx.compact`](./zk-circuit/contracts/zkrx.compact)
*   **📡 Contract Explorer**: [`ef1cc55f9f8b64b87026a1a7b2ea7af32409231dc80d47831fb0e2a20d5017de`](https://preprod.midnightexplorer.com/contracts/ef1cc55f9f8b64b87026a1a7b2ea7af32409231dc80d47831fb0e2a20d5017de) *(Note: Due to known RPC routing anomalies on the Midnight Explorer, you may need to access this link via a private network/VPN or Cloudflare DNS).*

---

## 👁️ THE VISION: PROBLEM & SOLUTION

### 🚨 The Problem: The Counterfeit Drug Crisis & Centralized Vulnerability
The global pharmaceutical supply chain loses billions annually to counterfeit drugs, introducing fatal risks to patients. Current tracing solutions rely heavily on centralized, permissioned databases where manufacturers upload proprietary serial numbers. These architectures inherently possess single points of failure. When a database is breached, malicious actors exfiltrate valid serial numbers, print them on counterfeit packaging, and successfully bypass network validation, rendering the entire tracking system mathematically compromised.

### 💊 The Solution: ZKRx Cryptographic Determinism
**ZKRx** entirely eliminates the need for centralized serial number repositories by leveraging the Midnight blockchain's **Selective Disclosure** architecture and zk-SNARKs (Zero-Knowledge Succinct Non-Interactive Arguments of Knowledge).

1. **Manufacturer Authorization:** Wallets must first execute the `initializeManufacturer` circuit to register their private identity on-chain as an authorized issuer.
2. **Batch & Item Binding:** Instead of exposing vulnerable databases, the authorized manufacturer generates an off-chain combinatorial hash of the batch ID and cryptographic private witnesses (`item_secret`). They deploy the batch hash and the strict Merkle-bound item commitments to the public ledger. 
3. **Zero-Knowledge Verification:** When a patient scans a drug's QR code, the ZKRx Next.js application bridges to their 1A.M. browser extension to execute a local proving circuit. The wallet computes a Zero-Knowledge Proof guaranteeing three strict invariants:
   - **Membership**: The specific `item_secret` is mathematically bound to a commitment deployed by an authorized manufacturer for that specific batch.
   - **Integrity**: The prover holds knowledge of the exact private `item_secret` matching the commitment.
   - **Uniqueness**: A deterministic collision-resistant **Nullifier** is derived from the `item_secret`. If this nullifier exists in the network's `consumed_nullifiers` set, the smart contract's state transition function rejects the transaction, mathematically preventing replay attacks and double-spending.

**Hackathon Category Alignment: Identity/credentials (Confidential Credentials)**
ZKRx is a textbook implementation of *Confidential Credentials* within the **Identity/credentials** category. It proves that a physical credential (the drug's cryptographic QR payload) is a valid, authentic member of a manufacturer's registered supply chain without ever disclosing the item's underlying identifier or private state to the public consensus network.

---

## 🏆 MIDNIGHT BUILDER CHALLENGE: CHECKLIST & PROOFS

Below is the definitive matrix mapping the Midnight Builder Challenge requirements to our precise implementation vectors.

### 🥉 Level 1 Submission Requirements

| Requirement | Technical Status | Implementation Proof |
| :--- | :--- | :--- |
| **Toolchain & Compile** | ✅ **Done.** | Verified via [`compile-out-backend.png`](./web-dapp/img/compile-out-backend.png) showing successful `compact compile` generating BZKIR bytes. |
| **Passing Test Suite** | ✅ **Done.** | Verified via [`3+passed_new.png`](./web-dapp/img/3+passed_new.png) proving deep circuit logic assertions. |
| **Managed Directory** | ✅ **Done.** | See [`zk-circuit/contracts/managed/`](./zk-circuit/contracts/managed/) containing `.pk` and `.vk` keys. |
| **Contract Deployed** | ✅ **Done.** | Verified via [`deployed-contract-new.png`](./web-dapp/img/deployed-contract-new.png) on Preprod explorer. |
| **Privacy Explanation** | ✅ **Done.** | Explained mathematically in the **Privacy Model** section below. |
| **Product Idea** | ✅ **Done.** | Documented in the **Vision: Problem & Solution** section above. |
| **Meaningful Commits** | ✅ **Done.** | Verified via >5 commits in the [GitHub Commit History](https://github.com/SimpleCoder26/ZKRx/commits/main). |

### 🥈 Level 2 Submission Requirements

| Requirement | Technical Status | Implementation Proof |
| :--- | :--- | :--- |
| **Wallet Connect/Disconnect** | ✅ **Done.** | Integrated via DApp Connector in [`MidnightProvider.tsx`](./web-dapp/src/providers/MidnightProvider.tsx#L55). |
| **Circuit Called from Frontend**| ✅ **Done.** | `verifyDrug` circuit executed via Wallet RPC in [`app/verify/page.tsx`](./web-dapp/src/app/verify/page.tsx). |
| **Observable Privacy Behavior** | ✅ **Done.** | **Nullifiers** implemented in [`zkrx.compact`](./zk-circuit/contracts/zkrx.compact). Double-scans fail without leaking the drug secret. |
| **Preprod Deployment Verification**| ✅ **Done.** | Address mapped at `0xef1cc55f9f8b64b87026a1a7b2ea7af32409231dc80d47831fb0e2a20d5017de`. |
| **Demo Video Link** | ✅ **Done.** | Hosted at [https://youtu.be/tnvLooVmSYw](https://youtu.be/tnvLooVmSYw). |
| **Live Demo Link** | ✅ **Done.** | Hosted at [https://zkrx.vercel.app/](https://zkrx.vercel.app/). |

### 🥇 Level 3 Submission Requirements

| Requirement | Technical Status | Implementation Proof |
| :--- | :--- | :--- |
| **Functional dApp Integration** | ✅ **Done.** | Full stack integration using `@midnight-ntwrk/midnight-js-protocol`. |
| **Minimum 3 Tests Passing** | ✅ **Done.** | See [`zkrx.test.ts`](./zk-circuit/tests/zkrx.test.ts) and visual proof in [`3+passed_new.png`](./web-dapp/img/3+passed_new.png). |
| **CI/CD Pipeline Running** | ✅ **Done.** | GitHub Actions configured in [`ci.yml`](./.github/workflows/ci.yml). Includes isolated compiler setup. |
| **Level 4 Idea Submission** | ✅ **Done.** | Built explicitly for the **Identity/credentials** category ([`PROPOSAL.md`](./PROPOSAL.md)). |
| **Test Output Screenshot** | ✅ **Done.** | Hosted at [`3+passed_new.png`](./web-dapp/img/3+passed_new.png). |
| **CI/CD Badge & Workflow** | ✅ **Done.** | Badge at top of README. Screenshot at [`ci-cd-pipeline.png`](./web-dapp/img/ci-cd-pipeline.png). |
| **Privacy Model "Observer"** | ✅ **Done.** | Deep technical breakdown in the **Privacy Model** section below. |

### ◑ Level 4 Submission Requirements

| Requirement | Technical Status | Implementation Proof |
| :--- | :--- | :--- |
| **Working MVP on Preprod** | ✅ **Done.** | Smart contract deployed to Midnight Preprod with live UI on Vercel. |
| **Documentation (README+Usage)** | ✅ **Done.** | Full README + new user guide at [`docs/USAGE.md`](./docs/USAGE.md). |
| **CI/CD Pipeline Running** | ✅ **Done.** | Updated `.github/workflows/ci.yml` using the authentic `@midnight-ntwrk/compact-compiler`. |
| **Product X Profile Created** | ✅ **Done.** | Active X profile established at [https://x.com/ZKRxPlatform](https://x.com/ZKRxPlatform). |
| **Minimum 15 Meaningful Commits**| ✅ **Done.** | Project has over 80 semantic commits. |
| **Live Preprod Demo Link** | ✅ **Done.** | [zkrx.vercel.app](https://zkrx.vercel.app/) |
| **Demo Video of MVP** | ✅ **Done.** | [youtu.be/tnvLooVmSYw](https://youtu.be/tnvLooVmSYw) |
| **Product Proposal** | ✅ **Done.** | Target users, use-case, and Mainnet plan at [`PROPOSAL.md`](./PROPOSAL.md). |

---

## 🧾 CHECKPOINT DELIVERABLES: VISUAL PROOFS

### 1. Zero-Knowledge Circuit Compilation (Backend)

*Terminal output verifying the successful compilation of the Midnight Compact ZK circuits (`zkrx.compact`) into BZKIR and ZKIR formats, generating the necessary proving and verification keys for local execution.*

**Technical Validation:** Validates the successful compilation of the `zkrx.compact` smart contract. Confirms the generation of BZKIR bytecode, ZKIR formats, and necessary cryptographic keys (`.pk` and `.vk`) within the `managed/` directory, satisfying Level 1 toolchain requirements.

<img src="./web-dapp/img/compile-out-backend.png" width="800" alt="Backend Compile Output">

<br>

### 2. DApp Production Build (Frontend)

*Next.js 16 production build output demonstrating the clean compilation of the frontend interface, static route generation, and WebAssembly integration logic via the Midnight.js SDK.*

**Technical Validation:** Demonstrates a zero-error Next.js 16 production build. Confirms the clean compilation of all App Router pages and successful integration of the `@midnight-ntwrk/midnight-js-protocol` WebAssembly dependencies into a production-ready frontend.

<img src="./web-dapp/img/compile-out-frontend.png" width="800" alt="Frontend Build Output">

<br>

### 3. Verified Preprod Network Deployment

*Official Midnight Explorer verification proving the smart contract is fully deployed and active on the Preprod blockchain, confirming its state is tracked by network consensus.*

**Technical Validation:** Provides on-chain proof of the ZKRx smart contract deployment on the Midnight Preprod testnet. Displays the deployed contract address and confirmed transaction hash, fulfilling Level 1 and 2 deployment requirements.

**Contract Explorer Link:** [0xef1cc55f9f8b64b87026a1a7b2ea7af32409231dc80d47831fb0e2a20d5017de](https://preprod.midnightexplorer.com/contracts/0xef1cc55f9f8b64b87026a1a7b2ea7af32409231dc80d47831fb0e2a20d5017de)

<img src="./web-dapp/img/deployed-contract-new.png" width="800" alt="Deployed Contract">

<br>

### 4. Verified ZK-Proof Submission on Preprod

*Official Midnight Explorer verification proving the successful submission of a Zero-Knowledge Proof to the Preprod network, executing the `verifyDrug` state transition securely.*

**Technical Validation:** Captures a confirmed 'DApp' transaction on the Preprod Explorer. This validates a successful Zero-Knowledge state transition, proving the frontend successfully generated a local ZK-Proof via the 1A.M. wallet and the network accepted it.

<img src="./web-dapp/img/successfull-txn.png" width="800" alt="Successful Transaction">

<br>

### 5. Passing Test Suite (Level 3 & 4)

*Terminal output proving all successful passing tests. Crucially, the tests rigorously validate circuit logic by ensuring `verifyDrug` mathematically rejects attempts on unregistered batches, protects against unauthorized wallets, avoids unissued secrets, and correctly increments sequential ledger state updates.*

**Technical Validation:** Displays 12 passing tests executed natively via `@midnight-ntwrk/compact-runtime`. Validates core cryptographic invariants including manufacturer authorization, nullifier collision prevention, and ledger state increments, exceeding the Level 3 minimum requirement.

<img src="./web-dapp/img/3+passed_new.png" width="800" alt="Passing Tests">

<br>

### 6. Unified CI/CD Pipeline (Level 3)

*GitHub Actions dashboard verifying the automated pipeline. As required for Level 3 compliance, this includes a dedicated `Compile Compact Contract` step executed successfully before running tests.*

**Technical Validation:** Verifies the automated CI/CD pipeline via GitHub Actions. Confirms that code pushes trigger a clean containerized environment that successfully compiles the ZK circuits and executes the test suite, fulfilling Level 3 pipeline requirements.

<img src="./web-dapp/img/ci-cd-pipeline.png" width="800" alt="CI/CD Pipeline">

---

## 🕵️‍♂️ PRIVACY MODEL: PUBLIC STATE AND PRIVATE WITNESS

ZKRx operates strictly within Midnight's Selective Disclosure framework. The isolation between public consensus and private execution is defined below.

### 👁️ PUBLIC STATE (What a Network Observer CAN Learn)
1. **Contract Initialization:** Observers can identify when the manufacturer initialized the contract and view the deployer's address.
2. **Allowlist Set Generation (`registered_batches`):** Observers can view the public state mapping `Map<Bytes<32>, Uint<32>>`. They know *a* batch was registered, its deterministic hash, and an integer tracking how many items from that batch have been successfully verified.
3. **Nullifier Emissions (`consumed_nullifiers`):** Observers can view an append-only `Set<Bytes<32>>`. When a drug is consumed, they see a random 32-byte hash added to this set, proving *some* drug was consumed.

### 🥷 PRIVATE WITNESS (What a Network Observer CANNOT Learn)
1. **The Item Secret:** The 32-byte cryptographic payload embedded in the drug's physical QR code is strictly a **Private Witness**. It is loaded into the 1A.M. wallet's private execution environment (`privateState`) and is *never* published to the ledger.
2. **The Specific Drug Identity:** Because the Nullifier is derived via a one-way hashing algorithm `hash(item_secret)`, the observer **cannot reverse-engineer** the Nullifier to determine which specific drug unit was scanned. 
3. **Double-Spend Execution Failures:** If a counterfeiter attempts to submit a proof for an already consumed drug, the smart contract assert fails. The observer sees a rejected transaction, but **cannot deduce** which specific drug or batch was being targeted for the replay attack.

---

## ⚙️ HIGH-LEVEL SYSTEM ARCHITECTURE

```mermaid
sequenceDiagram
    participant M as Manufacturer (Admin)
    participant N as Midnight Preprod Ledger
    participant P as Patient (1A.M. Wallet)
    
    M->>N: Deploy zkrx.compact
    Note over M,N: Generates Public Contract Address
    M->>N: Execute registerBatch()
    Note over M,N: Mutates Public State: Map[BatchHash] = 0
    M->>P: Distributes Drug with QR Code (Item Secret)
    P->>P: Scans QR Code
    P->>P: Wallet Computes Local ZK-SNARK (Private Witness)
    P->>N: Execute verifyDrug(Proof, Nullifier)
    N->>N: Network Validates Proof & Checks Nullifier
    N-->>P: State Transition Success (Authentic)
```

---

## 💻 TECHNOLOGY STACK
*   **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, Framer Motion
*   **Contracts**: Midnight Compact (`zkrx.compact`)
*   **Integration**: `@midnight-ntwrk/midnight-js-protocol` (Wallet API, Proof Provider, Indexer)
*   **Testing**: TSX Runner with Native AST Execution
*   **CI/CD**: GitHub Actions (Ubuntu-Latest)
*   **Network**: Midnight Preprod Testnet

---

## 📂 PROJECT STRUCTURE

```text
ZKRx/
├── zk-circuit/            # Midnight Backend
│   ├── contracts/         # ZKRx Compact contract
│   └── tests/             # Native ZK execution tests
├── web-dapp/              # Next.js Frontend
│   └── src/               # Wallet integration & UI
├── docs/                  
│   └── USAGE.md           # User-facing platform guide
├── PROPOSAL.md            # Approved Product Idea
└── .github/workflows/     # CI/CD pipeline
```

---

## 📖 USAGE GUIDE

For a step-by-step walkthrough of how to register batches, scan drugs, and understand the privacy guarantees, see:

**🔗 [`docs/USAGE.md`](./docs/USAGE.md)**

---

## 🐦 PRODUCT X PROFILE

**🐦 [Follow ZKRx on X](https://x.com/ZKRxPlatform)**

---

## 🚀 RUN LOCALLY

### Prerequisites
1. **Node.js**: `v22` or higher is strictly required for Midnight SDK compatibility.
2. **Wallet**: Install the **1A.M. Wallet** (or Lace) browser extension. *1A.M. is highly recommended for Preprod to avoid un-spendable DUST limits.*

### Step-by-Step Guide
1. **Clone the Repository:**
   ```bash
   git clone https://github.com/SimpleCoder26/ZKRx.git
   cd ZKRx
   ```
2. **Install Dependencies:**
   Our monorepo design installs both the circuit and frontend requirements simultaneously.
   ```bash
   npm install
   ```
3. **Compile Circuits (Optional, tracked in git):**
   ```bash
   npm run compile
   ```
4. **Launch the Frontend Server:**
   ```bash
   npm run dev
   ```
5. **Interact:**
   Navigate to `http://localhost:3000`. Connect your wallet, switch to the Preprod network, and experience Selective Disclosure in action.

---

<div align="center">
  <sub>Built with 🖤 for the Midnight Ecosystem</sub>
</div>
