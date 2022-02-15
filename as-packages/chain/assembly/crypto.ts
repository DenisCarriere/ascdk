import { check } from "./system"
import { Decoder, Encoder, Serializer } from "./serializer"

export class PublicKey implements Serializer {
    keyType: u8;
    data: Array<u8> | null;

    constructor(keyType: u8 = 0, data: u8[] | null = null) {
        if (data) {
            check(data.length == 33, "bad data size");
        }
        this.keyType = keyType;
        this.data = data;
    }

    serialize(): u8[] {
        let enc = new Encoder(34);
        enc.packNumber<u8>(this.keyType);
        enc.packBytes(this.data!);
        return enc.getBytes();
    }

    deserialize(data: u8[]): usize {
        let dec = new Decoder(data);
        this.keyType = dec.unpackNumber<u8>();
        this.data = dec.unpackBytes(33);
        return dec.getPos();
    }

    getSize(): usize {
        return 34;
    }

}