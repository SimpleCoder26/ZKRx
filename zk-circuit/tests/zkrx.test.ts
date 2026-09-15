import { test, describe } from 'node:test';
import assert from 'node:assert';
import { randomBytes } from 'node:crypto';
import * as compactRuntime from '@midnight-ntwrk/compact-runtime';
import { Contract, type Witnesses } from '../contracts/managed/zkrx/contract/index.js';

describe('ZKRx Contract - Native AST Execution Tests', () => {
    
    // We share these across tests
    const batchHash = randomBytes(32);
    const itemSecretBytes = randomBytes(32);

    test('1. Contract processes batch registration successfully', () => {
        const witnesses: Witnesses<any> = {
            itemSecret: (context: any) => [context.privateState, itemSecretBytes]
        };
        const contract = new Contract(witnesses);

        const constructorContext = (compactRuntime.createConstructorContext as any)({});
        const initialState = contract.initialState(constructorContext).currentContractState;

        const contractAddress = compactRuntime.sampleContractAddress();
        const coinPublicKey = compactRuntime.sampleUserAddress(); 

        const circuitContext = compactRuntime.createCircuitContext(
            contractAddress, 
            coinPublicKey, 
            initialState, 
            {}
        );

        assert.doesNotThrow(() => {
            const result = contract.circuits.registerBatch(circuitContext, batchHash);
            assert.ok(result.proofData, 'Proof data containing state transitions should be generated');
        }, 'registerBatch should succeed on the compiled contract AST');
    });

    test('2. Contract correctly rejects verifyDrug proof when batch is unregistered', () => {
        const witnesses: Witnesses<any> = {
            itemSecret: (context: any) => [context.privateState, itemSecretBytes]
        };
        const contract = new Contract(witnesses);

        const constructorContext = (compactRuntime.createConstructorContext as any)({});
        const initialState = contract.initialState(constructorContext).currentContractState;
        
        const contractAddress = compactRuntime.sampleContractAddress();
        const coinPublicKey = compactRuntime.sampleUserAddress(); 
        
        const circuitContext = compactRuntime.createCircuitContext(contractAddress, coinPublicKey, initialState, {});
        
        // 1. Try to verify a drug on an unregistered batch
        assert.throws(() => {
            contract.circuits.verifyDrug(circuitContext, batchHash);
        }, /failed assert: Invalid or unregistered batch/, 'verifyDrug should reject an unregistered batch');
    });

    test('3. Contract strictly initializes empty or valid private state', () => {
        const witnesses: Witnesses<any> = {
            itemSecret: (context: any) => [context.privateState, itemSecretBytes]
        };
        const contract = new Contract(witnesses);
        
        // Assert that the initial state compiles and returns the correct ledger schema
        const constructorContext = (compactRuntime.createConstructorContext as any)({});
        const initialState = contract.initialState(constructorContext);
        
        assert.ok(initialState, 'Initial state must be generated successfully');
        assert.ok(initialState.currentContractState, 'Contract state object must be initialized');
    });
});
