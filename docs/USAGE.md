# ✦ How to Use ZKRx Platform ✦

> **Secure the Source. Verify the Journey.**
> ZKRx lets pharmaceutical manufacturers prove the authenticity of their drugs to patients without exposing centralized supply chain databases to hackers.

---

## ✧ What You Need

### For Patients (Verifying a Drug)
- A modern web browser (Chrome, Brave, or Firefox recommended).
- A Midnight-compatible wallet extension installed (e.g., **1A.M. Wallet**).
- Your wallet configured to the **Midnight Preprod Testnet**.
- Testnet tDUST tokens (available from the Midnight faucet) to cover transaction fees.
- The ZKRx physical QR code found on the drug packaging.

### For Manufacturers (Registering a Batch)
*Note: In this MVP phase, batch registration is handled manually via the smart contract deployment. The manufacturer generates the batch hash and deploys it to the Midnight ledger.*

---

## ✧ For Patients — Verifying a Drug

### Step 1: Scan & Open the App
1. Scan the QR code on the drug packaging, which will open the ZKRx web portal (e.g., [zkrx.vercel.app](https://zkrx.vercel.app/)).
2. The URL will contain the cryptographic parameters needed for verification.

### Step 2: Connect Your Wallet
1. Click **"Connect Wallet"** on the main dashboard.
2. Select your wallet (e.g., 1A.M. Wallet).
3. Approve the connection within your wallet extension.

### Step 3: Execute the Zero-Knowledge Verification
1. Click the **"Verify Authenticity"** button.
2. ZKRx will automatically begin synthesizing a Zero-Knowledge Proof (zk-SNARK) inside your browser. 
3. **What happens here:** Your browser proves to the blockchain that the drug's secret payload (from the QR code) mathematically matches a valid batch registered by the manufacturer. It also derives a unique nullifier to check if this specific drug has already been scanned.
4. Your wallet will prompt you to sign the transaction. **Approve it**.

> **Important:** Keep your wallet extension open and unlocked. Generating the Zero-Knowledge proof locally is computationally intensive and may take 30–60 seconds.

### Step 4: View Verification Results
- **🟢 Authentic:** If the proof is valid and the nullifier has never been seen before, the transaction succeeds. You will see a green success screen confirming the drug is authentic.
- **🔴 Counterfeit / Double-Scan Warning:** If the exact same drug is scanned a second time, the Midnight blockchain will mathematically reject the transaction because the nullifier already exists. This alerts you that the QR code has been duplicated by a counterfeiter.

---

## ✧ What Gets Proved (and What Stays Private)

| What ZKRx Proves on the Blockchain | What Stays Completely Private |
|---|---|
| The drug belongs to a registered manufacturer batch | The drug's physical serial number or identity |
| The drug has never been verified/consumed before | The proprietary manufacturing records |
| The mathematical integrity of the physical item | The patient's wallet address and personal data |

**In plain English:** ZKRx proves *that* a drug is authentic, without revealing *which specific drug* it is to the public network, eliminating the risk of hackers stealing serial numbers.

---

## ✧ Troubleshooting

### "Transaction Failed / Nullifier Exists"
If you receive a rejection stating the drug has already been scanned, **do not consume the product**. This is the network successfully preventing a replay attack. The physical QR code you scanned is likely a duplicate printed by a counterfeiter.

### Wallet Connection Timeout
- Ensure your wallet extension is unlocked and set to the **Midnight Preprod** network.
- Try disconnecting from the top right and reconnecting.

### Verification Takes Too Long
- ZK proof generation happens locally on your device. Do not close the browser tab or lock your wallet during the 30–60 second proving phase.
