async function run() {
  const ledger = await import("@midnight-ntwrk/midnight-js-protocol/ledger");
  // Let's look at the transactionHash getter/method definition
  console.log(ledger.Transaction.prototype.transactionHash.toString());
}
run();
