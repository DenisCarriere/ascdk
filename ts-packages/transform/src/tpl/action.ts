import { CONFIG } from "../config/compile";
const scope = CONFIG.scope;

// parameters: ParameterNodeDef[] = [];
// methodName: string;

export const actionTpl = `class {{methodName}}Action implements _chain.Serializer {
    {{#each parameters}}
    {{#generateActionMember .}}{{/generateActionMember}}
    {{/each}}

    serialize(): u8[] {
        let enc = new _chain.Encoder(10);
        {{#each parameters}}
        {{{actionParameterSerialize .}}}
        {{/each}}
        return enc.getBytes();
    }
    
    deserialize(data: u8[]): usize {
        let dec = new _chain.Decoder(data);
        {{#each parameters}}
        {{{actionParameterDeserialize .}}}
        {{/each}}
        return dec.getPos();
    }

    getSize(): usize {
        let size: usize = 0;
        {{#each parameters}}
        {{{actionParameterGetSize .}}}
        {{/each}}
        return size;
    }
}
`;