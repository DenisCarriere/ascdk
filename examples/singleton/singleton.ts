import {
    table,
    contract,
    action,
    singleton,

    Name,
    Table,
    Contract,
    print,
} from "as-chain";

@table("counter", singleton)
class Counter extends Table {
    public count: u64;
    constructor(count: u64=0) {
        super();
        this.count = count;
    }
}

@contract("mycontract")
class MyContract extends Contract {
    constructor(receiver: Name, firstReceiver: Name, action: Name) {
        super(receiver, firstReceiver, action);
    }

    @action("test")
    test(): void {
        let payer = this.receiver;
        let db = Counter.new(this.receiver, this.receiver);
        let value = db.get_or_default()
        value.count += 1;
        db.set(value, payer);
        print(`+++++++++${value.count}`);
    }
}
