import {
    ClassPrototype,
    Program,
} from "assemblyscript";

import {
    ContractMetadata,
} from "contract-metadata/src/index";

import { ElementUtil } from "../utils/utils";

import { ProgramAnalyzar } from "./analyzer";
import { ClassInterpreter, ContractInterpreter, DynamicIntercepter, EventInterpreter, SerializerInterpreter, StorageInterpreter, TableInterpreter } from "./classdef";
import { NamedTypeNodeDef } from "./typedef";
import { MetadataGenerator } from "../metadata/generator";
import { ProgramDiagnostic } from "../diagnostic/diagnostic";
import { TypeKindEnum } from "../enums/customtype";
import { RangeUtil } from "../utils/utils";

export class ContractProgram {
    program: Program;
    contract!: ContractInterpreter;
    metatdata: ContractMetadata;
    events: EventInterpreter[] = [];
    storages: StorageInterpreter[] = [];
    dynamics: DynamicIntercepter[] = [];
    codecs: ClassInterpreter[]  = [];

    tables: TableInterpreter[] = [];
    serializers: SerializerInterpreter[] = [];
    
    public definedTypeMap: Map<string, NamedTypeNodeDef> = new Map<string, NamedTypeNodeDef>();

    constructor(program: Program) {
        this.program = program;
        this.resolveContract();
        this.getToGenCodecClass();
        this.metatdata = this.createMetadata();
    }

    private getToGenCodecClass(): void {
        this.definedTypeMap.forEach((item, key) => {
            if (item.typeKind == TypeKindEnum.USER_CLASS && !item.isCodec) {
                let classInterpreter = new ClassInterpreter(<ClassPrototype>item.current);
                classInterpreter.resolveFieldMembers();
                this.codecs.push(classInterpreter);
            }
        });
    }

    private createMetadata(): ContractMetadata {
        return new MetadataGenerator(this).createMetadata();
    }
    
    private resolveContract(): void {
        let countContract = 0;

        this.program.elementsByName.forEach((element, _) => {
            if (ElementUtil.isTopContractClass(element)) {
                countContract ++;
                this.contract = new ContractInterpreter(<ClassPrototype>element);
                if (countContract > 1) {
                    throw Error(`Only one Contract class allowed! Trace ${RangeUtil.location(this.contract.declaration.range)}`);
                }
            }
            if (ElementUtil.isStoreClassPrototype(element)) {
                this.storages.push(new StorageInterpreter(<ClassPrototype>element));
            }
            if (ElementUtil.isEventClassPrototype(element)) {
                let eventInterpreter = new EventInterpreter(<ClassPrototype>element);
                eventInterpreter.index = this.events.length;
                this.events.push(eventInterpreter);
            }
            if (ElementUtil.isDynamicClassPrototype(element)) {
                let dynamicInterpreter = new DynamicIntercepter(<ClassPrototype>element);
                this.dynamics.push(dynamicInterpreter);
            }

            if (ElementUtil.isTableClassPrototype(element)) {
                let intercepter = new TableInterpreter(<ClassPrototype>element);
                this.tables.push(intercepter);
            }
            
            if (ElementUtil.isSerializerClassPrototype(element)) {
                let intercepter = new SerializerInterpreter(<ClassPrototype>element);
                this.serializers.push(intercepter);
            }            
        });
        if (countContract != 1) {
            throw new Error(`The entry file should contain only one '@contract', in fact it has ${countContract}`);
        }
        this.setTypeSequence();
    }

    private setTypeSequence(): void {
        if (this.contract) {
            this.contract.genTypeSequence(this.definedTypeMap);
        }
        this.storages.forEach(storage => {
            storage.genTypeSequence(this.definedTypeMap);
        });
        this.events.forEach(event => {
            event.genTypeSequence(this.definedTypeMap);
        });
    }
}

export function getContractInfo(program: Program): ContractProgram {
    new ProgramAnalyzar(program);
    let contract = new ContractProgram(program);
    new ProgramDiagnostic(contract);
    return contract;
}
