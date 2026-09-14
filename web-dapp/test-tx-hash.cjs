const { toHex, fromHex } = require("@midnight-ntwrk/midnight-js-utils");
async function run() {
  const { Transaction } = await import("@midnight-ntwrk/midnight-js-protocol/ledger");
  // Let's create a dummy unproven transaction
  // Actually, we don't need a valid transaction to see what the return type is, 
  // but it's a WASM method, so it's likely a string.
  console.log("Testing toHex behavior on string:");
  console.log(toHex("f84649a149d2b57c5f10ba3bfc9e32b09a812ee64e0d7a2fbf5008428299768b"));
}
run();
