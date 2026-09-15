<div align="center">
  <h1>ZKRx: Zero-Knowledge Pharmaceutical Verification</h1>
  <p><em>A Midnight Builder Challenge Level 3 Product Proposal</em></p>
</div>

---

## 1. The Problem: The $4.4 Billion Supply Chain Vulnerability

The global pharmaceutical supply chain is plagued by a $4.4 billion counterfeit crisis, primarily driven by the industry's reliance on centralized, mutable serial-number databases. 

**The Web3 Paradox:** Transparent public ledgers (e.g., Ethereum, Solana) cannot resolve this vulnerability. Publishing plaintext serial numbers on a public ledger creates an irreversible vector for counterfeiters to clone valid identifiers. Conversely, relying on off-chain execution environments (TEEs) or federated oracles reintroduces the exact centralization and trust bottlenecks that Web3 aims to eliminate.

---

## 2. The Solution: Cryptographic Selective Disclosure

**ZKRx** is a decentralized, privacy-preserving verification protocol engineered exclusively for the Midnight blockchain. By leveraging Midnight’s native **Selective Disclosure** capabilities, ZKRx implements a trustless **Private Allowlist Access** pattern. 

The protocol achieves absolute verification of pharmaceutical authenticity via Zero-Knowledge succinct non-interactive arguments of knowledge (zk-SNARKs) without exposing the underlying physical payload data to the consensus layer.

### Protocol Mechanics:
1. **Cryptographic Commitment:** A manufacturer commits a batch to the ledger by submitting a cryptographic hash of the batch metadata, establishing an immutable state root.
2. **Local Proof Generation:** A consumer scans a physical QR code containing the `itemSecret`. The Midnight.js provider serializes this secret and compiles a local Zero-Knowledge Proof entirely within the client's execution environment.
3. **State Transition Verification:** The Midnight smart contract validates the proof against the batch hash predicate. 
4. **Deterministic Nullification:** Upon successful verification, the circuit emits a deterministically derived nullifier hash. This prevents double-spend (double-scanning) of the drug unit while keeping the `itemSecret` structurally isolated as a private witness.

---

## 3. The Privacy Model & Data Architecture

To mathematically guarantee the zero-knowledge properties of the protocol, ZKRx utilizes a rigorously partitioned data model, strictly isolating public state from private witness data:

| Cryptographic Primitive | Contract State Layer | Consensus Visibility |
| :--- | :--- | :--- |
| **Batch Commitment Hash** | Public Ledger (`Map<Bytes<32>, Uint<32>>`) | **Public** — Immutable, verifiable record of issuance. |
| **Consumption Invariant** | Public Ledger | **Public** — Transparent delta tracking of batch consumption. |
| **Nullifier Accumulator** | Public Ledger (`Set<Bytes<32>>`) | **Public** — Opaque hashes guarding against replay attacks without exposing payload identity. |
| **Item Secret (QR Payload)** | Private Witness | **Zero-Knowledge** — Ephemeral; never leaves the client's local memory stack. |
| **Drug-to-Nullifier Mapping** | Compiled Circuit Logic | **Computationally Hidden** — Obfuscated within the proof generation. |

---

## 4. Mainnet Feasibility & Infrastructure Scalability

ZKRx is engineered as a highly optimized, production-ready decentralized application, primed for Mainnet deployment.

1. **O(1) Contract Complexity**  
   The `zkrx.compact` AST contains two highly streamlined circuits (`registerBatch` and `verifyDrug`). State transitions are O(1) in time complexity, guaranteeing deterministic and minimal gas consumption regardless of network congestion.

2. **Zero-Oracle Architecture**  
   The protocol operates entirely within Midnight's native runtime environment. By eliminating dependencies on cross-chain bridges, third-party indexers, or off-chain API gateways, ZKRx drastically reduces the system's attack surface.

3. **Optimized Client-Side Proving**  
   The compiled BZKIR bytecodes generate a remarkably lean prover key (~2.8MB). This lightweight footprint is specifically engineered to support seamless in-browser proving via native wallets (like 1A.M.), bypassing the heavy resource constraints typically associated with client-side zk-SNARK generation.

4. **Enterprise-Grade Regulatory Compliance**  
   Hospital supply chains and regulatory bodies (FDA, EMA) require stringent HIPAA/GDPR data compliance. Because ZKRx processes sensitive supply-chain metadata locally and only broadcasts cryptographically secure proofs to the mempool, it perfectly bridges the gap between enterprise confidentiality and blockchain immutability.

**Conclusion:** ZKRx is not merely a proof-of-concept. It is a highly scalable, cryptographically secure architecture poised to solve a critical real-world vulnerability by pushing the limits of the Midnight network's privacy-first execution environment.
