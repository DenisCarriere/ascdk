import Handlebars from "handlebars";
import { FieldDef, FunctionDef } from "../contract/elementdef";
import { TypeKindEnum } from "../enums/customtype";
import { KeySelector } from "./selector";

const WIN = process.platform === "win32";
const EOL = WIN ? "\r\n" : "\n";

let scope = "_lang.";

Handlebars.registerHelper("storeGetter", function (field: FieldDef) {
    let code: string[] = [];
    if (field.type.typeKind == TypeKindEnum.ARRAY || field.type.typeKind == TypeKindEnum.MAP) {
        code.push(`get ${field.name}(): ${field.type.codecTypeAlias} {`);
        code.push(`     if (this.${field.varName} === null) {`);
        code.push(`       const st = new ${field.type.codecTypeGeneric}("${field.selector.key}");`);
    } else {
        code.push(`get ${field.name}(): ${field.type.plainType} {`);
        code.push(`     if (this.${field.varName} === null) {`);
        code.push(`    const st = new ${scope}Storage(new ${scope}Hash(${field.selector.u8Arr}));`);
    }
    code.push(`     }`);
    if (field.type.typeKind == TypeKindEnum.STRING) {
        code.push(`     return this.${field.varName}!.toString();`);
    } else if (field.type.typeKind == TypeKindEnum.ARRAY || field.type.typeKind == TypeKindEnum.MAP) {
        code.push(`     return this.${field.varName}!;`);
    } else {
        code.push(`     return this.${field.varName}!.unwrap();`);
    }
    code.push("  }");
    return code.join(EOL);
});

/**
 *  set {{name}}(v: {{type.plainType}}) {
    this.{{varName}} = new {{type.codecTypeAlias}}(v);
    const st = new ${scope}Storage(new ${scope}Hash({{selector.u8Arr}}));
    st.store<{{type.codecTypeAlias}}>(this.{{varName}}!);
  }
 * 
 */
Handlebars.registerHelper("storeSetter", function (field: FieldDef) {
    let code: string[] = [];
    if (field.type.typeKind == TypeKindEnum.ARRAY || field.type.typeKind == TypeKindEnum.MAP) {
        return code.join("\n");
    }
    code.push(`set ${field.name}(v: ${field.type.plainType}) {`);
    code.push(` this.${field.varName} = new ${field.type.codecTypeAlias}(v);`);
    code.push(` const st = new ${scope}Storage(new ${scope}Hash(${field.selector.u8Arr}));`);
    code.push(` st.store<${field.type.codecTypeAlias}>(this.${field.varName}!);`);
    code.push(` }`);
    return code.join("\n");
});


/**
 * Register the tag of each.
 */
Handlebars.registerHelper("each", function (context, options) {
    var ret = "";
    for (var i = 0, j = context.length; i < j; i++) {
        let data = context[i];
        data._index = i;
        data.isMid = (i != j - 1 || (i == 0 && j != 1));
        ret = ret + options.fn(data);
    }
    return ret;
});

/**
 * Register the tag of selector.
 */
Handlebars.registerHelper("selector", function (context, options) {
    // let data = context;
    let data = new KeySelector(context);
    return options.fn(data);
});

/**
 * Register the tag of selector.
 * if exist the selector using the selector otherwise create the selector 
 * according to the key.
 * 
 */
Handlebars.registerHelper("existSelector", function (key, existSelector, options) {
    let data = {};
    if (existSelector) {
        let selectorArr = [];
        for (let index = 0; index < 4; index++) {
            selectorArr.push("0x" + existSelector.substring(index * 2 + 2, index * 2 + 4));
        }
        data.short = `${existSelector}`;
        data.u8Arr = `[${selectorArr.join(",")}]`;
    } else {
        data = new KeySelector(key);
    }
    return options.fn(data);
});

/**
 * Register the tag of join.
 */
Handlebars.registerHelper("joinParams", function (context) {
    var data = [];
    for (var i = 0, j = context.length; i < j; i++) {
        if (context[i].type.codecType == "ScaleString") {
            data.push("p" + i + ".toString()");
        } else if (context[i].type.typeKind == TypeKindEnum.USER_CLASS) {
            data.push("p" + i);
        } else {
            data.push("p" + i + ".unwrap()");
        }
    }
    return data.join(",");
});

Handlebars.registerHelper("generateFunction", function (fn: FunctionDef) {
    let funParams = [];
    let funVarious = [];
    for (let i = 0; i < fn.parameters.length; i++) {
        let param = fn.parameters[i];
        funParams.push(`p${i}: ${param.type.plainType}`);
        if (param.type.typeKind == TypeKindEnum.NUMBER) {
            funVarious.push(`new ${param.type.codecTypeAlias}(p${i})`);
        } else {
            funVarious.push(`p${i})`);
        }
    }
    let func = `${fn.methodName}(${funParams.join(",")}): ${fn.isReturnable ? fn.returnType?.plainType : "void"} {
        ${fn.isReturnable ? "let rs = " : ""}_lang.Abi.encode("${fn.methodName}", [${funVarious.join(",")}]);
        ${fn.isReturnable ? "return rs;" : ""}
    }`;
    return func;
});

/**
 * Register the tag of equal
 */
Handlebars.registerHelper("eq", function (v1, v2, options) {
    console.log(`eq`, v1, v2);
    if (v1 == v2) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

/**
 * Register the tag of neq (Not equal)
 */
Handlebars.registerHelper("neq", function (v1, v2, options) {
    if (v1 != v2) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

export default Handlebars;