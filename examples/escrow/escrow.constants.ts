import { ActionWrapper, Name, Table } from "as-chain"

// Contract
export const escrow = Name.fromString("escrow")

// Tables
export const escrows = Name.fromString("escrows")
export const accounts = Name.fromString("escraccounts")
export const globall = Name.fromString("globall")

// Actions
export const startescrow = new ActionWrapper(Name.fromString("startescrow"));
export const fillescrow = new ActionWrapper(Name.fromString("fillescrow"));
export const cancelescrow = new ActionWrapper(Name.fromString("cancelescrow"));
export const logescrow = new ActionWrapper(Name.fromString("logescrow"));


// Notifications
export const transfer = Name.fromString("transfer")

// External
export const atomicassets = Name.fromString("atomicassets");


// Status
export namespace ESCROW_STATUS {
    export const START = 'start';
    export const FILL = 'fill';
    export const CANCEL = 'cancel';
}
export type ESCROW_STATUS = string;

// Include
@packer
class empty extends Table { constructor() { super(); } }