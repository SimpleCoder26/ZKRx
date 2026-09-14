<div align="center">
  <h1>🛡️ ZKRx Platform 🛡️</h1>
  
  <p align="center">
    <strong>A Zero-Knowledge Pharmaceutical Verification Engine built on the Midnight Blockchain.</strong>
  </p>
  
  [![CI/CD Status](https://github.com/SimpleCoder26/ZKRx/actions/workflows/ci.yml/badge.svg)](https://github.com/SimpleCoder26/ZKRx/actions)
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![Midnight Blockchain](https://img.shields.io/badge/Network-Midnight_Preprod-558763.svg)](https://midnight.network/)
  [![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
  [![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED.svg)](https://www.docker.com/)

  *Secure the Source. Verify the Journey. Cryptographically prove drug authenticity without exposing private manufacturing secrets.*

</div>

---

## ⚡ SUBMISSION DETAILS & QUICK LINKS

*   **🌐 Network**: Midnight Preprod Testnet
*   **💻 GitHub Repository**: [https://github.com/SimpleCoder26/ZKRx](https://github.com/SimpleCoder26/ZKRx)
*   **🔗 Live Demo**: [To be added by author]
*   **🎬 Demo Video**: [To be added by author]
*   **🏆 Approved Category**: **Private Allowlist Access**
*   **⚙️ Smart Contract**: [`zkrx.compact`](./zk-circuit/contracts/zkrx.compact)
*   **📡 Contract Address**: [`0x0d2181f9545b4f21f142eb81970c50887363533bd55f51e5a4dade7e096f27f4`](https://preprod.midnightexplorer.com/contracts/0d2181f9545b4f21f142eb81970c50887363533bd55f51e5a4dade7e096f27f4)

---

## 🧠 THE VISION: PROBLEM & SOLUTION

### 🧨 The Counterfeit Drug Crisis
The pharmaceutical supply chain is plagued by counterfeit drugs, costing billions and endangering millions. Traditional verification relies on centralized databases where manufacturers upload serial numbers. These are highly vulnerable to hacks and leaks. If breached, counterfeiters can steal legitimate serial numbers, completely defeating the system.

### 🔐 The ZKRx Cryptographic Solution
**ZKRx** fundamentally changes tracking by mathematically guaranteeing product authenticity without a centralized point of failure. 

Built natively on the Midnight blockchain, ZKRx leverages a powerful **Selective Disclosure** architecture. When a manufacturer registers a drug batch, they register a cryptographic hash on-chain, not a vulnerable database.

When scanned, the patient’s wallet computes a Zero-Knowledge Proof (ZKP) locally. This proof cryptographically guarantees to the `zkrx.compact` smart contract that:
1. The drug belongs to a legitimately registered batch.
2. The drug possesses the correct private item secret.
3. The drug has not been consumed before (enforced via a mathematically unique **Nullifier**).

---

## 🏗️ INFRASTRUCTURE & RECENT UPGRADES

We have significantly upgraded the infrastructure for maximum resilience, performance, and developer experience:

### 🐋 Dockerized Midnight Proof Server
To eliminate remote server latency and cross-origin bottlenecks, ZKRx now ships with a fully containerized **Local Proof Server**.
*   **Container**: `midnightntwrk/proof-server:8.1.0`
*   **Architecture**: Plugs directly into the Midnight JS SDK to provide blazing-fast, localized Zero-Knowledge Proof generation natively for developers.
*   **Execution**: Easily spun up via our `docker-compose.yml`.

### 🎨 Next.js Frontend & UI Overhaul
*   **Aesthetic Integration**: Completely refactored the UI to a modern, minimalist pure-black & white aesthetic matching the sleekest Web3 startup standards.
*   **Dynamic Explorer Routing**: Integrated seamless verification links redirecting straight to `preprod.midnightexplorer.com` with real-time hash tracking.
*   **Robust Wallet Hydration**: Implemented strict local storage caching to maintain wallet state and fix network desync glitches in the Lace/1AM connector.

---

## 🛡️ PRIVACY MODEL: ZERO-KNOWLEDGE IN ACTION

### 👁️ PUBLIC STATE (What the network sees)
- **Batch Exists:** Observers can see a new batch was registered on-chain with a unique Batch Hash.
- **Verification Volume:** Observers can read the ledger to see *how many* times drugs from a specific batch have been verified.
- **Nullifier Set:** Observers see a list of random 32-byte hashes (nullifiers), indicating *some drug* was consumed.

### 🥷 PRIVATE WITNESS (What remains hidden)
- **The Item Secret:** The private item secret embedded in the drug's QR code is never published. It acts as a persistent private witness to generate the ZK nullifier.
- **Specific Drug ID:** The observer **cannot** link a nullifier back to a specific drug unit.
- **Double-Scanning Attempts:** The observer only sees that an anonymous transaction was mathematically rejected due to a ZK nullifier collision.

---

## 💻 MIDNIGHT BUILDER CHALLENGE CHECKLIST

### 🥉 Level 1 
| Status | Requirement | Implementation Proof |
| :---: | :--- | :--- |
| ✅ | **Toolchain & Compile** | The `zkrx.compact` circuit successfully compiles. |
| ✅ | **Passing Test Suite** | Backend test suite validates contract logic. |
| ✅ | **Contract Deployed** | Successfully deployed to Preprod (`0x0d2181...`). |
| ✅ | **Privacy Explanation** | Detailed in the Privacy Model section above. |

### 🥈 Level 2
| Status | Requirement | Implementation Proof |
| :---: | :--- | :--- |
| ✅ | **Wallet Connection** | Robust connection logic in `MidnightProvider.tsx`. |
| ✅ | **Circuit Call**| `registerBatch` & `verifyDrug` invoked in-browser. |
| ✅ | **Observable Privacy** | Nullifiers cryptographically prevent double-scans without revealing secrets. |

### 🥇 Level 3
| Status | Requirement | Implementation Proof |
| :---: | :--- | :--- |
| ✅ | **Full dApp Integration** | Midnight JS SDK integrated for autonomous manufacturer deployment. |
| ✅ | **CI/CD Pipeline** | GitHub Actions enabled and running. |

---

## 🚀 SETUP & RUN LOCALLY

### Prerequisites
1. **Node.js**: v22 or higher.
2. **Docker**: Required to run the local Proof Server.
3. **Wallet**: **1A.M. Wallet** (or Lace) extension.

### Quick Start
1. **Clone & Install:**
   ```bash
   git clone https://github.com/SimpleCoder26/ZKRx.git
   cd ZKRx
   npm install
   ```

2. **Spin up the Proof Server (Docker):**
   ```bash
   docker-compose up -d
   ```

3. **Compile the Smart Contract:**
   ```bash
   npm run compile
   ```

4. **Launch the Frontend:**
   ```bash
   npm run dev
   ```

5. **Open the dApp:**
   Visit `http://localhost:3000` in your browser. Connect your 1A.M. wallet and interact with the Live Preprod network!

---

<div align="center">
  <sub>Built with 🖤 for the Midnight Ecosystem</sub>
</div>
