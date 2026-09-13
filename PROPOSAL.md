# Product Proposal — ZKRx

## What is the product, and who uses it?

**ZKRx** is a Zero-Knowledge pharmaceutical verification platform built on the Midnight blockchain. It allows drug manufacturers to register pharmaceutical batches on-chain, and patients or pharmacists to verify individual drug units without exposing private manufacturing secrets.

**Users:**
- **Manufacturers** register drug batches by submitting a cryptographic hash of the batch metadata to the Midnight smart contract.
- **Patients / Pharmacists** scan a QR code on the drug packaging and submit a Zero-Knowledge Proof to verify that the drug belongs to a legitimate batch and has not been scanned before.

The product addresses the $4.4 billion counterfeit drug crisis by replacing vulnerable centralized serial-number databases with cryptographic proofs that cannot be forged, leaked, or reverse-engineered.

## Why Midnight specifically?

Midnight is the only blockchain that natively supports **Selective Disclosure** — the ability to prove something about private data without ever revealing the data itself.

A transparent chain (Ethereum, Solana, etc.) would require either:
1. Publishing serial numbers on-chain (defeating the purpose — counterfeiters could copy them), or
2. Using an off-chain oracle (reintroducing centralization).

Midnight solves this by allowing the `itemSecret` (the private per-drug identifier) to remain as a **private witness** that never touches the public ledger. The ZK proof mathematically guarantees the drug is authentic without the network ever learning the secret. This is precisely the **Private Allowlist Access** pattern: proving that an item belongs to a registered allowlist (the batch) without revealing the item's identity (the secret).

## Data Model

| Data Point | Type | Disclosed To |
|---|---|---|
| Batch Hash | Public ledger (`Map<Bytes<32>, Uint<32>>`) | Everyone — visible on-chain |
| Verification Count per Batch | Public ledger | Everyone — visible on-chain |
| Consumed Nullifiers | Public ledger (`Set<Bytes<32>>`) | Everyone — visible as opaque hashes |
| Item Secret (per-drug QR code) | Private witness | No one — never on-chain |
| Drug-to-Nullifier Mapping | Derived inside ZK circuit | No one — computationally hidden |
| Manufacturer Identity | Not stored | No one — not part of the protocol |

## Mainnet Feasibility

ZKRx is realistic for Mainnet deployment by Level 6:

1. **Contract complexity is low.** The `zkrx.compact` contract has only two circuits (`registerBatch`, `verifyDrug`) with straightforward state transitions. Gas costs are minimal.
2. **No external dependencies.** The contract does not rely on oracles, bridges, or off-chain services beyond the standard Midnight proof server.
3. **Proving time is acceptable.** The `verifyDrug` prover key is ~2.8MB — well within browser proving capabilities via the 1A.M. wallet's in-browser proving provider.
4. **The product has clear adoption paths.** Pharmaceutical regulators, hospital supply chains, and pharmacy networks are actively seeking tamper-proof verification systems. A Midnight-based solution offers regulatory compliance (data never leaves the device) combined with on-chain auditability.
5. **Scaling is handled by Midnight's architecture.** Each verification is an independent transaction with no cross-contract dependencies, so throughput scales linearly with network capacity.

The primary Mainnet prerequisite is legal/regulatory review of the privacy claims for pharmaceutical compliance (FDA, EMA), which is outside the scope of this technical prototype but feasible for a production rollout.
