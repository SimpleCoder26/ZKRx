import { createWallet, persistWalletState, type WalletContext } from './wallet';
import * as Rx from 'rxjs';
import { NetworkId } from '@midnight-ntwrk/zswap';
import { resolveNetwork, getOrCreateWallet } from './network';

async function main() {
  console.log('─── Standalone Sync Script ─────────────────────────────────────\n');
  
  // Auto-restart every 2 minutes to gracefully handle WebSocket drops
  setTimeout(() => {
    console.log('  [↻] Restarting process to resume sync from last saved point...');
    process.exit(1);
  }, 120000);

  const { network, config: networkConfig } = resolveNetwork();
  const { seed } = getOrCreateWallet(network);

  if (!seed) {
    console.error('No seed found in state.');
    process.exit(1);
  }

  const walletCtx = await createWallet({ network, networkConfig, seed, restore: true, cwd: process.cwd() });
  console.log('\n  Wallet started. Syncing in background...\n');

  // Auto-save every 10 seconds
  const saverInterval = setInterval(async () => {
    try {
      await persistWalletState(network, walletCtx);
      // console.log(`  [+] Saved state to disk...`);
    } catch (err) {
      console.error(`  [!] Save failed:`, err);
    }
  }, 10000);

  // Poll for DUST every 5 seconds
  while (true) {
    const stateSnapshot = await Rx.firstValueFrom(walletCtx.wallet.state().pipe(Rx.take(1)));
    
    const dustCoins = stateSnapshot.unshielded?.balances?.DUST || 0n;
    const blockHeight = stateSnapshot.unshielded?.blockHeight || 'Unknown';
    
    if (dustCoins > 0n) {
      console.log(`\n  ✅ DUST GENERATION SYNCED! Found ${dustCoins} DUST at Block ${blockHeight}`);
      console.log(`  Run the deployment script now!`);
      await persistWalletState(network, walletCtx);
      await walletCtx.wallet.stop();
      process.exit(0);
    } else {
      console.log(`  ⏳ Syncing... 0 DUST found. Current Block Height: ${blockHeight}`);
      // The background wallet provider is actively syncing blocks...
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }
  }
}

main().catch((err) => {
  console.error('\n  ❌ Crash:', err);
  process.exit(1);
});
