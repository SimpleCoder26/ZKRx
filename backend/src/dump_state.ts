import { resolveNetwork, getOrCreateWallet } from './network';
import { createWallet } from './wallet';
import * as Rx from 'rxjs';

async function main() {
  const { network, config } = resolveNetwork();
  const { seed } = getOrCreateWallet(network);
  const walletCtx = await createWallet({ network, networkConfig: config, seed });
  
  const state = await Rx.firstValueFrom(walletCtx.wallet.state().pipe(Rx.take(1)));
  
  console.log("State keys:", Object.keys(state));
  if (state.unshielded) {
    console.log("Unshielded keys:", Object.keys(state.unshielded));
  }
  
  // Try to find anything with 'height' or 'block'
  console.log(JSON.stringify(state, (k, v) => (k.toLowerCase().includes('height') || k.toLowerCase().includes('block')) ? v : undefined, 2));
  
  process.exit(0);
}

main().catch(console.error);
