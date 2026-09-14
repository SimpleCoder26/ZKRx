import { toHex } from "@midnight-ntwrk/midnight-js-utils";
async function run() {
  const ledger = await import("@midnight-ntwrk/midnight-js-protocol/ledger");
  console.log("Transaction methods:", Object.getOwnPropertyNames(ledger.Transaction.prototype));
  console.log("TransactionHash methods:", Object.getOwnPropertyNames(ledger.TransactionHash?.prototype || {}));
}
run();
