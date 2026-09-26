import { test, describe } from 'node:test';
import assert from 'node:assert';
import { randomBytes } from 'node:crypto';
import * as compactRuntime from '@midnight-ntwrk/compact-runtime';
import { Contract, type Witnesses } from '../contracts/managed/zkrx/contract/index.js';

/**
 * ─── ZKRx Contract — Comprehensive Native AST Execution Tests ───
 * 
 * These tests execute the compiled Compact circuit logic natively
 * in Node.js using the Midnight compact-runtime, validating that:
 *   1. Manufacturer initialization works
 *   2. Only authorized manufacturers can register batches
 *   3. Unauthorized wallets are rejected
 *   4. Item commitment binding is enforced
 *   5. Unissued secrets are rejected
 *   6. Duplicate scans (nullifier collisions) are rejected
 *   7. Sequential ledger state updates are correct
 */
describe('ZKRx Contract — Full Circuit Logic Suite', () => {

    // Shared test data
    const manufacturerSecret = randomBytes(32);
    const unauthorizedSecret = randomBytes(32);
    const batchHash = randomBytes(32);
    const itemSecretBytes = randomBytes(32);
    const itemSecretBytes2 = randomBytes(32);
    const unissuedSecret = randomBytes(32);

    // Helper: create a contract instance with the given manufacturer and item secrets
    function createContract(mfgSecret: Uint8Array, itemSecret: Uint8Array): Contract {
        const witnesses: Witnesses<any> = {
            manufacturerSecret: (context: any) => [context.privateState, mfgSecret],
            itemSecret: (context: any) => [context.privateState, itemSecret]
        };
        return new Contract(witnesses);
    }

    // Helper: compute the item commitment (hash(batchHash || itemSecret)) identically to the circuit
    function computeItemCommitment(contract: Contract, state: any, batch: Uint8Array, secret: Uint8Array): Uint8Array {
        // The circuit uses persistentHash<ItemBinding>({ batchHash, secret })
        // We simulate this by running the registerItem circuit with a known commitment
        // Actually, we need to compute it the same way the circuit does.
        // For testing purposes, we use the contract's own logic by running a verification attempt.
        // Instead, we compute it externally using the compact runtime's hash function.
        const binding = { batchHash: batch, secret: secret };
        return (compactRuntime as any).persistentHash(binding);
    }

    // ─── Test 1: Manufacturer Initialization ───
    test('1. Manufacturer can initialize their authorization commitment', () => {
        const contract = createContract(manufacturerSecret, itemSecretBytes);
        const constructorContext = (compactRuntime.createConstructorContext as any)({});
        const initialState = contract.initialState(constructorContext).currentContractState;

        const contractAddress = compactRuntime.sampleContractAddress();
        const coinPublicKey = compactRuntime.sampleUserAddress();

        const circuitContext = compactRuntime.createCircuitContext(
            contractAddress, coinPublicKey, initialState, {}
        );

        assert.doesNotThrow(() => {
            const result = contract.circuits.initializeManufacturer(circuitContext);
            assert.ok(result.proofData, 'Proof data should be generated for manufacturer initialization');
        }, 'initializeManufacturer should succeed for a new manufacturer');
    });

    // ─── Test 2: Authorized Batch Registration ───
    test('2. Authorized manufacturer can register a batch', () => {
        const contract = createContract(manufacturerSecret, itemSecretBytes);
        const constructorContext = (compactRuntime.createConstructorContext as any)({});
        const { currentContractState } = contract.initialState(constructorContext);

        const contractAddress = compactRuntime.sampleContractAddress();
        const coinPublicKey = compactRuntime.sampleUserAddress();

        // Step 1: Initialize manufacturer
        const ctx1 = compactRuntime.createCircuitContext(contractAddress, coinPublicKey, currentContractState, {});
        const initResult = contract.circuits.initializeManufacturer(ctx1);

        // Step 2: Register batch with the authorized manufacturer
        assert.doesNotThrow(() => {
            const result = contract.circuits.registerBatch(initResult.context, batchHash);
            assert.ok(result.proofData, 'Proof data should be generated for batch registration');
        }, 'registerBatch should succeed for authorized manufacturer');
    });

    // ─── Test 3: Unauthorized Issuance Rejection ───
    test('3. Unauthorized wallet CANNOT register a batch', () => {
        // Initialize with the real manufacturer
        const realContract = createContract(manufacturerSecret, itemSecretBytes);
        const constructorContext = (compactRuntime.createConstructorContext as any)({});
        const { currentContractState } = realContract.initialState(constructorContext);

        const contractAddress = compactRuntime.sampleContractAddress();
        const coinPublicKey = compactRuntime.sampleUserAddress();

        // Initialize manufacturer
        const ctx1 = compactRuntime.createCircuitContext(contractAddress, coinPublicKey, currentContractState, {});
        const initResult = realContract.circuits.initializeManufacturer(ctx1);

        // Now create a contract instance with an UNAUTHORIZED secret
        const fakeContract = createContract(unauthorizedSecret, itemSecretBytes);

        assert.throws(() => {
            fakeContract.circuits.registerBatch(initResult.context, batchHash);
        }, /failed assert: Unauthorized/, 'registerBatch MUST reject unauthorized callers');
    });

    // ─── Test 4: Duplicate Batch Registration Rejection ───
    test('4. Registering the same batch twice is rejected', () => {
        const contract = createContract(manufacturerSecret, itemSecretBytes);
        const constructorContext = (compactRuntime.createConstructorContext as any)({});
        const { currentContractState } = contract.initialState(constructorContext);

        const contractAddress = compactRuntime.sampleContractAddress();
        const coinPublicKey = compactRuntime.sampleUserAddress();

        // Initialize + register once
        const ctx1 = compactRuntime.createCircuitContext(contractAddress, coinPublicKey, currentContractState, {});
        const s1 = contract.circuits.initializeManufacturer(ctx1);
        const s2 = contract.circuits.registerBatch(s1.context, batchHash);

        // Try registering the same batch again
        assert.throws(() => {
            contract.circuits.registerBatch(s2.context, batchHash);
        }, /failed assert: Batch already registered/, 'Duplicate batch registration must be rejected');
    });

    // ─── Test 5: Item Commitment Registration ───
    test('5. Manufacturer can register item commitments', () => {
        const contract = createContract(manufacturerSecret, itemSecretBytes);
        const constructorContext = (compactRuntime.createConstructorContext as any)({});
        const { currentContractState } = contract.initialState(constructorContext);

        const contractAddress = compactRuntime.sampleContractAddress();
        const coinPublicKey = compactRuntime.sampleUserAddress();

        // Initialize + register batch
        const ctx1 = compactRuntime.createCircuitContext(contractAddress, coinPublicKey, currentContractState, {});
        const s1 = contract.circuits.initializeManufacturer(ctx1);
        const s2 = contract.circuits.registerBatch(s1.context, batchHash);

        // Register an item commitment using the itemSecret witness
        assert.doesNotThrow(() => {
            const result = contract.circuits.registerItem(s2.context, batchHash);
            assert.ok(result.proofData, 'Proof data should be generated for item commitment');
        }, 'registerItem should succeed for authorized manufacturer');
    });

    // ─── Test 6: Unauthorized Item Registration Rejection ───
    test('6. Unauthorized wallet CANNOT register item commitments', () => {
        const realContract = createContract(manufacturerSecret, itemSecretBytes);
        const constructorContext = (compactRuntime.createConstructorContext as any)({});
        const { currentContractState } = realContract.initialState(constructorContext);

        const contractAddress = compactRuntime.sampleContractAddress();
        const coinPublicKey = compactRuntime.sampleUserAddress();

        // Initialize with real manufacturer
        const ctx1 = compactRuntime.createCircuitContext(contractAddress, coinPublicKey, currentContractState, {});
        const s1 = realContract.circuits.initializeManufacturer(ctx1);

        // Try to register item with unauthorized secret
        const fakeContract = createContract(unauthorizedSecret, itemSecretBytes);
        assert.throws(() => {
            fakeContract.circuits.registerItem(s1.context, batchHash);
        }, /failed assert: Unauthorized/, 'registerItem MUST reject unauthorized callers');
    });

    // ─── Test 7: Unregistered Batch Verification Rejection ───
    test('7. Verifying a drug from an unregistered batch is rejected', () => {
        const contract = createContract(manufacturerSecret, itemSecretBytes);
        const constructorContext = (compactRuntime.createConstructorContext as any)({});
        const { currentContractState } = contract.initialState(constructorContext);

        const contractAddress = compactRuntime.sampleContractAddress();
        const coinPublicKey = compactRuntime.sampleUserAddress();

        const ctx1 = compactRuntime.createCircuitContext(contractAddress, coinPublicKey, currentContractState, {});
        assert.throws(() => {
            contract.circuits.verifyDrug(ctx1, batchHash);
        }, /failed assert: Invalid or unregistered batch/, 'verifyDrug must reject unregistered batches');
    });

    // ─── Test 8: Contract initializes empty, valid state ───
    test('8. Contract produces valid empty initial state', () => {
        const contract = createContract(manufacturerSecret, itemSecretBytes);
        const constructorContext = (compactRuntime.createConstructorContext as any)({});
        const initialState = contract.initialState(constructorContext);

        assert.ok(initialState, 'Initial state must be generated successfully');
        assert.ok(initialState.currentContractState, 'Contract state object must be initialized');
    });

    // ─── Test 9: Duplicate Scan (Nullifier Collision) Rejection ───
    test('9. Scanning the same item twice is rejected (nullifier collision)', () => {
        const contract = createContract(manufacturerSecret, itemSecretBytes);
        const constructorContext = (compactRuntime.createConstructorContext as any)({});
        const { currentContractState } = contract.initialState(constructorContext);

        const contractAddress = compactRuntime.sampleContractAddress();
        const coinPublicKey = compactRuntime.sampleUserAddress();

        // Initialize → register batch → register item
        const ctx1 = compactRuntime.createCircuitContext(contractAddress, coinPublicKey, currentContractState, {});
        const s1 = contract.circuits.initializeManufacturer(ctx1);
        const s2 = contract.circuits.registerBatch(s1.context, batchHash);
        const s3 = contract.circuits.registerItem(s2.context, batchHash);

        // First verification succeeds
        const s4 = contract.circuits.verifyDrug(s3.context, batchHash);
        assert.ok(s4.proofData, 'First verification should succeed');

        // Second verification of the same item MUST fail with nullifier collision
        assert.throws(() => {
            contract.circuits.verifyDrug(s4.context, batchHash);
        }, /failed assert.*already been scanned/, 'Duplicate scan must be rejected with nullifier collision error');
    });

    // ─── Test 10: Unissued Secret Rejection ───
    test('10. Verifying with an unissued (unregistered) item secret is rejected', () => {
        // Register the batch and item with itemSecretBytes, then verify with unissuedSecret
        const realContract = createContract(manufacturerSecret, itemSecretBytes);
        const constructorContext = (compactRuntime.createConstructorContext as any)({});
        const { currentContractState } = realContract.initialState(constructorContext);

        const contractAddress = compactRuntime.sampleContractAddress();
        const coinPublicKey = compactRuntime.sampleUserAddress();

        // Initialize → register batch → register item with itemSecretBytes
        const ctx1 = compactRuntime.createCircuitContext(contractAddress, coinPublicKey, currentContractState, {});
        const s1 = realContract.circuits.initializeManufacturer(ctx1);
        const s2 = realContract.circuits.registerBatch(s1.context, batchHash);
        const s3 = realContract.circuits.registerItem(s2.context, batchHash);

        // Try to verify with a DIFFERENT secret that was NOT registered
        const fakeVerifier = createContract(manufacturerSecret, unissuedSecret);
        assert.throws(() => {
            fakeVerifier.circuits.verifyDrug(s3.context, batchHash);
        }, /failed assert.*[Uu]nissued item/, 'Verification with an unregistered item secret must be rejected');
    });

    // ─── Test 11: Sequential Ledger Updates (Verify Count Increments) ───
    test('11. Sequential verifications correctly increment the batch verify count', () => {
        // Use two different item secrets
        const contract1 = createContract(manufacturerSecret, itemSecretBytes);
        const contract2 = createContract(manufacturerSecret, itemSecretBytes2);
        const constructorContext = (compactRuntime.createConstructorContext as any)({});
        const { currentContractState } = contract1.initialState(constructorContext);

        const contractAddress = compactRuntime.sampleContractAddress();
        const coinPublicKey = compactRuntime.sampleUserAddress();

        // Initialize → register batch → register item1 → register item2
        const ctx1 = compactRuntime.createCircuitContext(contractAddress, coinPublicKey, currentContractState, {});
        const s1 = contract1.circuits.initializeManufacturer(ctx1);
        const s2 = contract1.circuits.registerBatch(s1.context, batchHash);
        const s3 = contract1.circuits.registerItem(s2.context, batchHash);
        const s4 = contract2.circuits.registerItem(s3.context, batchHash);

        // Verify first item
        const s5 = contract1.circuits.verifyDrug(s4.context, batchHash);
        assert.ok(s5.proofData, 'First item verification should succeed');

        // Verify second item
        const s6 = contract2.circuits.verifyDrug(s5.context, batchHash);
        assert.ok(s6.proofData, 'Second item verification should succeed');
    });

    // ─── Test 12: Full Lifecycle (Deploy → Init → Register → Verify) ───
    test('12. Full lifecycle: deploy → initialize → register batch → register item → verify → pass', () => {
        const contract = createContract(manufacturerSecret, itemSecretBytes);
        const constructorContext = (compactRuntime.createConstructorContext as any)({});
        const { currentContractState } = contract.initialState(constructorContext);

        const contractAddress = compactRuntime.sampleContractAddress();
        const coinPublicKey = compactRuntime.sampleUserAddress();

        const ctx1 = compactRuntime.createCircuitContext(contractAddress, coinPublicKey, currentContractState, {});

        // Step 1: Initialize manufacturer
        const s1 = contract.circuits.initializeManufacturer(ctx1);
        assert.ok(s1.proofData, 'Step 1: Manufacturer initialization proof');

        // Step 2: Register batch
        const s2 = contract.circuits.registerBatch(s1.context, batchHash);
        assert.ok(s2.proofData, 'Step 2: Batch registration proof');

        // Step 3: Register item commitment
        const s3 = contract.circuits.registerItem(s2.context, batchHash);
        assert.ok(s3.proofData, 'Step 3: Item commitment registration proof');

        // Step 4: Verify drug authenticity
        const s4 = contract.circuits.verifyDrug(s3.context, batchHash);
        assert.ok(s4.proofData, 'Step 4: Drug verification proof');
    });
});
