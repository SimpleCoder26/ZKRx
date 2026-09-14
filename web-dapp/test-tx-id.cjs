const { toHex } = require("@midnight-ntwrk/midnight-js-utils");
async function run() {
  const { Transaction } = await import("@midnight-ntwrk/midnight-js-protocol/ledger");
  // we might need a real transaction to call transactionHash()
  console.log(typeof Transaction.prototype.transactionHash);
}
run();
