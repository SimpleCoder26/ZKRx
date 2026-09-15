<div align="center">
  <h1>ZKRx: Zero-Knowledge Pharmaceutical Verification</h1>
  <p><em>A privacy-preserving pharmaceutical verification protocol built for the Midnight blockchain.</em></p>
</div>

---

## THE PROBLEM: The $4.4 Billion Supply-Chain Vulnerability

The global pharmaceutical supply chain faces a $4.4 billion counterfeit crisis, driven in part by reliance on centralized, mutable serial-number databases.

*   Public blockchains cannot safely publish plaintext pharmaceutical identifiers, as exposed credentials could potentially be cloned.
*   Off-chain verification services and federated oracles reintroduce centralized trust and infrastructure dependencies.
*   The challenge is to make pharmaceutical credentials verifiable without exposing the sensitive data behind them.

---

## THE SOLUTION: Cryptographic Selective Disclosure

ZKRx is a decentralized, privacy-preserving pharmaceutical verification protocol engineered for Midnight.

*   Uses Midnight’s privacy-preserving architecture and Selective Disclosure capabilities.
*   Implements a Confidential Credentials model for pharmaceutical verification.
*   Uses zero-knowledge proofs to prove that a private pharmaceutical credential is valid without revealing the underlying item secret.
*   Allows manufacturers to establish verifiable commitments while keeping sensitive pharmaceutical data private.

---

## PROTOCOL MECHANICS

*   **Cryptographic Commitment:** A manufacturer commits a pharmaceutical batch to the ledger using a cryptographic hash of its metadata, creating an immutable verification anchor.
*   **Local Proof Generation:** A consumer scans a physical QR code containing the private item credential. The credential is processed locally to generate a zero-knowledge proof without exposing the secret.
*   **State Transition Verification:** The Midnight smart contract verifies the proof against the corresponding batch commitment.
*   **Deterministic Nullification:** After successful verification, a deterministic nullifier is generated to prevent duplicate verification or replay while keeping the item credential private.

---

## PRIVACY MODEL

*   **Batch Commitment Hash:** `PUBLIC` — Immutable and verifiable record of manufacturer issuance.
*   **Verification State:** `PUBLIC` — Records the relevant verification state without exposing private credentials.
*   **Nullifier:** `PUBLIC` — Opaque cryptographic value used for replay and duplicate-verification protection.
*   **Item Secret / QR Payload:** `PRIVATE` — Used as a zero-knowledge witness and never exposed on-chain.
*   **Credential-to-Nullifier Relationship:** `COMPUTATIONALLY HIDDEN` — Derived during proof generation without revealing the underlying credential.

---

## MAINNET FEASIBILITY AND SCALABILITY

ZKRx is designed around a lightweight, privacy-first architecture suitable for scalable deployment on Midnight.

*   **Constant-Size State Transitions:** Verification is designed around compact state updates rather than exposing or processing the complete private credential on-chain.
*   **Zero-Oracle Architecture:** Core verification does not depend on external verification APIs or trusted federated oracles.
*   **Client-Side Proving:** Sensitive credentials remain within the user’s local execution environment during proof generation.
*   **Enterprise Privacy:** Sensitive pharmaceutical metadata remains confidential while the blockchain provides an immutable and independently verifiable verification layer.

---

## CONCLUSION

ZKRx transforms pharmaceutical verification from a transparent identifier database into a privacy-preserving credential system.

*   **Commit publicly.**
*   **Prove privately.**
*   **Verify cryptographically.**
*   **Prevent replay.**

By combining Midnight’s privacy architecture with cryptographic commitments, zero-knowledge proofs, selective disclosure, and deterministic nullifiers, ZKRx aims to provide a practical foundation for confidential and verifiable pharmaceutical authenticity.
