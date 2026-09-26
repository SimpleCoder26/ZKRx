import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type ManufacturerAuth = { secret: Uint8Array };

export type ItemBinding = { batchHash: Uint8Array; secret: Uint8Array };

export type NullifierInput = { batchHash: Uint8Array; secret: Uint8Array };

export type Witnesses<PS> = {
  manufacturerSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  itemSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  initializeManufacturer(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  registerBatch(context: __compactRuntime.CircuitContext<PS>,
                batchHash_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  registerItem(context: __compactRuntime.CircuitContext<PS>,
               batchHash_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  verifyDrug(context: __compactRuntime.CircuitContext<PS>,
             batchHash_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  initializeManufacturer(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  registerBatch(context: __compactRuntime.CircuitContext<PS>,
                batchHash_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  registerItem(context: __compactRuntime.CircuitContext<PS>,
               batchHash_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  verifyDrug(context: __compactRuntime.CircuitContext<PS>,
             batchHash_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  initializeManufacturer(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  registerBatch(context: __compactRuntime.CircuitContext<PS>,
                batchHash_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  registerItem(context: __compactRuntime.CircuitContext<PS>,
               batchHash_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  verifyDrug(context: __compactRuntime.CircuitContext<PS>,
             batchHash_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  authorized_manufacturers: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  registered_batches: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  item_commitments: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  consumed_nullifiers: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
