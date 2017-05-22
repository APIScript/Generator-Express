
import {API} from "apiscript";
import {TypescriptWriter} from "./typescript-writer";

import * as transform from "../util/text-transformers";

export function writeEnumClasses(api: API, libDir: string) {

    api.forEachEnum((enumerator) => {
        let name = enumerator.name;
        let fileName = transform.pascalToDash(name);
        let writer = new TypescriptWriter(`${libDir}/entity/${fileName}.ts`);

        console.log(`Generating enum ${enumerator.name}`);

        writer.newLine();
        writer.write(`export const enum ${name} `);
        writer.openClosure();
        writer.newLine();

        let enumCount = enumerator.valueCount;

        enumerator.forEachValue((value, index) => {
            writer.indent();
            writer.write(value);

            if (index < enumCount - 1) {
                writer.write(',');
            }

            writer.newLine();
        });

        writer.closeClosure();
        writer.close();
    });
}