# ZKRx — Wallet Integration Fixes & Technical Documentation

> **Date:** 2026-09-14  
> **Scope:** MidnightProvider.tsx, WalletConnect.tsx, manufacturer/page.tsx, verify/page.tsx  
> **Wallets Tested:** 1A.M. Wallet, Lace Wallet (Midnight extension)

---

## Summary of Issues & Fixes

This document records every bug encountered during the ZKRx wallet integration and the exact fix applied. These fixes are specific to the Midnight Network DApp Connector API (`@midnight-ntwrk/dapp-connector-api@4.0.1`) and the Midnight JS SDK (`@midnight-ntwrk/*@4.1.1`).

---

## 1. Auto-Connect on Page Refresh

### Problem
Every time the user refreshed the page, the app would aggressively call `executeConnection()` which popped open the wallet extension dialog unprompted. This was extremely annoying UX — the wallet should only connect when the user explicitly clicks "Connect Wallet".

### Root Cause
The `useEffect` on mount was reading `localStorage('zkrx_connected_wallet')` and immediately calling `executeConnection(savedWallet)`, which triggers `wallet.connect()` — a call that prompts the wallet extension.

### Fix — Passive State Hydration
Instead of re-executing the full wallet connection on load, we now **passively hydrate** the UI from cached localStorage values (address, balance) without touching the wallet extension at all:

```typescript
useEffect(() => {
  const savedWallet = localStorage.getItem('zkrx_connected_wallet');
  const savedAddress = localStorage.getItem('zkrx_wallet_address');
  const savedBalance = localStorage.getItem('zkrx_wallet_balance');
  
  if (savedWallet && savedAddress) {
    // Restore UI state only — no wallet popup
    setWalletAddress(savedAddress);
    setWalletBalance(savedBalance || '0.00');
    setWalletConnected(true);
    setNetworkId('preprod');
  }
}, []);
```

The real wallet connection is deferred to a **just-in-time `ensureConnection()`** that fires only when the user actually tries to perform a transaction (see Fix #3).

### Files Changed
- [`src/providers/MidnightProvider.tsx`](file:///Users/bapi/new-project/web-dapp/src/providers/MidnightProvider.tsx) — `useEffect` on mount

---

## 2. Disconnect Not Clearing All State

### Problem
Disconnecting the wallet didn't fully clear cached session data, so the app would still appear "connected" after a page refresh.

### Fix
The `disconnectWallet` function now aggressively clears all localStorage keys and all React state + refs:

```typescript
const disconnectWallet = () => {
  setWalletConnected(false);
  setWalletAddress(null);
  walletAddressRef.current = null;
  setWalletBalance(null);
  setNetworkId(null);
  setConnectedApi(null);
  connectedApiRef.current = null;
  setMidnightProviders(null);
  midnightProvidersRef.current = null;
  compiledContractRef.current = null;
  setConnectionStatus('idle');
  localStorage.removeItem('zkrx_connected_wallet');
  localStorage.removeItem('zkrx_wallet_address');
  localStorage.removeItem('zkrx_wallet_balance');
};
```

### Files Changed
- [`src/providers/MidnightProvider.tsx`](file:///Users/bapi/new-project/web-dapp/src/providers/MidnightProvider.tsx) — `disconnectWallet()`

---

## 3. "Please connect your wallet first" — React State Race Condition

### Problem
After a page refresh, the UI showed the wallet as connected (via passive hydration), but `connectedApi` and `midnightProviders` were `null` (React state). When the user clicked "Register Batch", the `ensureConnection()` function called `executeConnection()` which set these values via `setState()` — but **React state updates are asynchronous**. The very next line checking `if (!connectedApi)` always found `null` because React hadn't re-rendered yet.

### Root Cause
React's `setState` is batched and asynchronous. Values set via `setConnectedApi(api)` are not readable until the next render cycle. But `registerBatch()` reads them on the same tick.

### Fix — useRef Mirrors
We added **`useRef` mirrors** alongside every critical piece of state. Refs update **synchronously** and are readable immediately:

```typescript
// Refs mirror the state so transaction functions can read them synchronously
const connectedApiRef = useRef<ConnectedAPI | null>(null);
const midnightProvidersRef = useRef<any>(null);
const compiledContractRef = useRef<any>(null);
const walletAddressRef = useRef<string | null>(null);
```

Inside `executeConnection()`, both state AND ref are set:
```typescript
setConnectedApi(api);
connectedApiRef.current = api;  // Available immediately

setMidnightProviders(providers);
midnightProvidersRef.current = providers;  // Available immediately
```

All transaction functions (`registerBatch`, `verifyDrug`, `deploySmartContract`) now read from **refs**, not state:
```typescript
const registerBatch = async (batchHash) => {
  await ensureConnection();
  const api = connectedApiRef.current;       // ← Ref, not state
  const providers = midnightProvidersRef.current;
  const compiled = compiledContractRef.current;
  if (!api || !providers) throw new Error('Please connect your wallet first');
  // ... proceed with transaction
};
```

### Files Changed
- [`src/providers/MidnightProvider.tsx`](file:///Users/bapi/new-project/web-dapp/src/providers/MidnightProvider.tsx) — Added refs, updated `ensureConnection()`, `registerBatch()`, `verifyDrug()`, `deploySmartContract()`

---

## 4. `expected instance of LedgerParameters` — Duplicate WASM Module

### Problem
Transactions crashed with: `Error: expected instance of LedgerParameters` at `_assertClass` inside `ledger-v8` WASM bindings.

### Root Cause
NPM installed **two separate copies** of `@midnight-ntwrk/ledger-v8`:
- `node_modules/@midnight-ntwrk/ledger-v8/` → **v8.1.2**
- `node_modules/@midnight-ntwrk/midnight-js-protocol/node_modules/@midnight-ntwrk/ledger-v8/` → **v8.1.0**

The `compact-js` package created a `LedgerParameters` object using v8.1.2's class definition, then passed it to `midnight-js-protocol` which ran `instanceof` against v8.1.0's class definition. In JavaScript, `instanceof` checks the prototype chain — two different file paths = two different class identities = always `false`.

The terminal confirmed two WASM files being loaded:
```
[browser] ../node_modules/@midnight-ntwrk/ledger-v8/midnight_ledger_wasm_bg.wasm
[browser] ../node_modules/@midnight-ntwrk/midnight-js-protocol/node_modules/@midnight-ntwrk/ledger-v8/midnight_ledger_wasm_bg.wasm
```

### Fix
1. **Deleted the nested duplicate:**
   ```bash
   rm -rf node_modules/@midnight-ntwrk/midnight-js-protocol/node_modules/@midnight-ntwrk/ledger-v8
   ```

2. **Added overrides to root `package.json`** (required for NPM Workspaces — overrides in workspace `package.json` are ignored):
   ```json
   {
     "overrides": {
       "@midnight-ntwrk/ledger-v8": "8.1.2",
       "@midnight-ntwrk/onchain-runtime-v3": "^3.1.0"
     }
   }
   ```

3. **Cleared `.next` cache** to force webpack to rebuild with a single copy:
   ```bash
   rm -rf web-dapp/.next
   ```

### Verification
```bash
find node_modules -name "midnight_ledger_wasm_bg.wasm"
# Should return exactly ONE result
```

### Files Changed
- [`package.json`](file:///Users/bapi/new-project/package.json) (root) — Added `overrides`
- Physical deletion of nested `node_modules` directory

---

## 5. Wrong Transaction Hash Displayed

### Problem
After a successful transaction with 1A.M. wallet, the UI displayed a garbage transaction hash starting with `6d69646e...` ("midn" in ASCII). This was the first 64 characters of the raw serialized transaction — not the actual blockchain transaction hash.

### Root Cause
The DApp Connector API's `submitTransaction()` method returns **`Promise<void>`**, not `Promise<string>`:

```typescript
// From @midnight-ntwrk/dapp-connector-api/dist/api.d.ts
submitTransaction(tx: string): Promise<void>;
```

Our `submitTx` implementation had cascading fallback checks that all failed (because the result was `undefined`), falling through to:
```typescript
return txHex.slice(0, 64);  // ← Garbage! First 64 chars of serialized tx
```

### Fix
Since the wallet doesn't return a hash, we **compute it ourselves** via SHA-256 of the serialized transaction bytes:

```typescript
const midnightProvider = {
  submitTx: async (tx: any) => {
    const txBytes = tx.serialize();
    const txHex = toHex(txBytes);
    
    // submitTransaction returns void — compute hash via SHA-256
    await api!.submitTransaction(txHex);
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', txBytes);
    const hashHex = toHex(new Uint8Array(hashBuffer));
    return hashHex;
  }
};
```

### Files Changed
- [`src/providers/MidnightProvider.tsx`](file:///Users/bapi/new-project/web-dapp/src/providers/MidnightProvider.tsx) — `midnightProvider.submitTx()`

---

## 6. Explorer Link Missing `0x` Prefix

### Problem
The "View on Midnight Explorer" link generated URLs like:
```
https://preprod.midnightexplorer.com/transaction/bc30d8f8da...
```
But the Midnight Explorer expects the `0x` prefix:
```
https://preprod.midnightexplorer.com/transaction/0xbc30d8f8da...
```

### Fix
Added `0x` prefix to all explorer links:

```tsx
href={`https://preprod.midnightexplorer.com/transaction/0x${txHash}`}
```

### Files Changed
- [`src/app/manufacturer/page.tsx`](file:///Users/bapi/new-project/web-dapp/src/app/manufacturer/page.tsx#L131) — Explorer link
- [`src/app/verify/page.tsx`](file:///Users/bapi/new-project/web-dapp/src/app/verify/page.tsx#L122) — Explorer link

---

## 7. Lace Wallet — `'prove' returned an error: TypeError: Failed to fetch`

### Problem
Lace wallet connected successfully but transactions failed with:
```
Error: 'prove' returned an error: TypeError: Failed to fetch
```

### Root Cause
Both 1A.M. and Lace expose a `getProvingProvider()` function. However:
- **1A.M.** bundles a full **in-browser WASM prover** — proving happens locally, no network needed.
- **Lace** delegates proving to an **external HTTP server** — its `getProvingProvider()` returns a provider that tries to `fetch()` from a remote endpoint that doesn't exist in the user's environment.

Our code checked `typeof api.getProvingProvider === 'function'` and used it for both wallets, but Lace's provider immediately crashed with `Failed to fetch`.

### Fix
Detect the wallet ID and **skip `getProvingProvider` for Lace**, falling back to `httpClientProofProvider`:

```typescript
const isLaceWallet = walletId === 'lace';
if (!isLaceWallet && typeof api.getProvingProvider === 'function') {
  // 1AM: use in-browser prover
  const baseProvingProvider = await api.getProvingProvider(zkConfig);
  providers.proofProvider = {
    async proveTx(unprovenTx) {
      const { CostModel } = await import('@midnight-ntwrk/midnight-js-protocol/ledger');
      return unprovenTx.prove(baseProvingProvider, CostModel.initialCostModel());
    }
  };
} else {
  // Lace: use external proof server
  providers.proofProvider = httpClientProofProvider(
    process.env.NEXT_PUBLIC_PROOF_SERVER_URL || 'http://localhost:6300',
    zkConfig
  );
}
```

> **Important:** For Lace wallet transactions to work, a Midnight proof server must be running at `localhost:6300` (or the URL specified by `NEXT_PUBLIC_PROOF_SERVER_URL`). The 1A.M. wallet does not require this.

### Files Changed
- [`src/providers/MidnightProvider.tsx`](file:///Users/bapi/new-project/web-dapp/src/providers/MidnightProvider.tsx) — Proving provider selection logic

---

## 8. DUST Balance Display — Wrong Decimal Conversion

### Problem
The wallet showed 1,259 tDUST but the navbar displayed `1258485410000.00 tDUST`.

### Root Cause
The `getDustBalance()` API returns a `bigint` with **15 decimals** of precision (not 6 like Cardano ADA). Our code was dividing by `1,000,000` (10^6) instead of `10^15`:

```typescript
// WRONG — Cardano-style 6 decimals
const formattedBalance = (Number(dust.balance) / 1000000).toFixed(2);
```

### Fix
Use BigInt division to handle 15 decimal places safely:

```typescript
const formattedBalance = (
  Number(dust.balance / 10000000000000n) / 100
).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
```

### Files Changed
- [`src/providers/MidnightProvider.tsx`](file:///Users/bapi/new-project/web-dapp/src/providers/MidnightProvider.tsx) — Balance formatting

---

## Quick Reference: Wallet Capabilities

| Feature | 1A.M. Wallet | Lace Wallet |
|---------|-------------|-------------|
| `window.midnight` key | `'1am'` | `'lace'` |
| `connect()` | ✅ Works | ✅ Works |
| `submitTransaction()` | ✅ Returns `void` | ✅ Returns `void` |
| `getProvingProvider()` | ✅ In-browser WASM prover | ❌ Tries remote fetch (fails) |
| `getDustBalance()` | ✅ Returns `bigint` (15 decimals) | ✅ Returns `bigint` (15 decimals) |
| Requires proof server | ❌ No | ✅ Yes (`localhost:6300`) |

---

## Key Takeaways for Future Midnight DApp Development

1. **`submitTransaction()` returns `void`** — Always compute the tx hash yourself via SHA-256.
2. **`getDustBalance()` uses 15 decimal places** — Not 6 like Cardano.
3. **NPM Workspace overrides must be in the root `package.json`** — Overrides in workspace packages are silently ignored.
4. **Never auto-connect wallets on page load** — Use passive localStorage hydration + lazy `ensureConnection()`.
5. **Use `useRef` mirrors for any state read in async transaction functions** — React `setState` is batched and won't be visible on the same tick.
6. **Lace and 1AM have different proving capabilities** — Always check the wallet ID before choosing a proving strategy.
7. **Midnight Explorer expects `0x` prefix** on transaction hashes in URLs.
