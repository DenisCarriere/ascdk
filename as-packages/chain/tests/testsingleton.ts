import {
    Name,
    Table,
    Contract,
    print,
    check,
} from "as-chain";

@table("counter", "singleton")
class Counter extends Table {
    public count: u64;
    constructor(count: u64=0) {
        super();
        this.count = count;
    }
}

@contract
class MyContract extends Contract {
    constructor(receiver: Name, firstReceiver: Name, action: Name) {
        super(receiver, firstReceiver, action);
    }

    @action("test")
    test(): void {
        let payer = this.receiver;
        {
            let db = Counter.new(this.receiver, this.receiver);
            let value = db.getOrNull();
            check(value == null, "bad value 1");
        }

        {
            let db = Counter.new(this.receiver, this.receiver);
            let value = db.get();
            check(value.count == 0, "bad value 2");
            value.count += 1;
            db.set(value, payer);
            print(`+++++++++${value.count}\n`);    
        }

        {
            let db = Counter.new(this.receiver, this.receiver);
            let value = db.get()
            print(`++++++++value:${value.count}\n`)
            check(value.count == 1, "bad value 3");
            
            db.remove()
            value = db.get()
            check(value.count == 0, "bad value 4");
        }
    }
}
