import { resolveNetwork, getOrCreateWallet } from './network';
import { createWallet } from './wallet';
import * as Rx from 'rxjs';

async function main() {
  const { network, config } = resolveNetwork();
  const { seed } = getOrCreateWallet(network);
  
  console.log(`Starting wallet for network: ${network}`);
  const walletCtx = await createWallet({ network, networkConfig: config, seed });
  
  const state = await Rx.firstValueFrom(walletCtx.wallet.state().pipe(Rx.take(1)));
  
  console.log(`CURRENT SYNC PROGRESS (BLOCK HEIGHT)`);
  console.log(`Block Height: ${state.indexerState?.blockHeight || state.unshielded?.blockHeight || 'Unknown'}`);
  
  process.exit(0);
}

main().catch(console.error);
