import { Asset, Name, table, primary, Table } from "as-chain";

@table("accounts")

export class account extends Table {
    balance: Asset;

    constructor (balance: Asset = new Asset()) {
        super();
        this.balance = balance;
    }

    @primary
    get primary(): u64 {
        return this.balance.symbol.code();
    }
}

@table("stat")
export class currency_stats extends Table {
    supply: Asset;
    max_supply: Asset;
    issuer: Name;

    constructor (
       supply: Asset = new Asset(),
       max_supply: Asset =  new Asset(),
       issuer: Name = new Name(),
    ) {
        super();
        this.supply = supply;
        this.max_supply = max_supply;
        this.issuer = issuer;
    }

    @primary
    get primary(): u64 {
        return this.supply.symbol.code();
    }
}

export class Account extends account {}
export class Stat extends currency_stats {}
