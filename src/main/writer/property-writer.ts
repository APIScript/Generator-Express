
import * as apiscript from "apiscript";
import * as transform from "../util/text-transformers";
import * as propertyUtil from "../util/property-util";

import {TypescriptWriter} from "./typescript-writer";

export function writePropertyImports(dir: string, writer: TypescriptWriter, propertyHolder: apiscript.Entity | apiscript.Endpoint): number {
    let importTypes = propertyUtil.calculatePropertyImports(propertyHolder);

    importTypes.forEach((importType) => {
        writer.write(`import {${importType}} from '${dir}/${transform.pascalToDash(importType)}';`);
        writer.newLine();
    });

    return importTypes.size;
}

export function writeProperty(writer: TypescriptWriter, property: apiscript.Property) {
    writer.indent();

    writer.write(`public ${property.name}`);
    if (property.isOptional) { writer.write('?'); }
    writer.write(`: ${propertyUtil.propertyTypeToString(property.type)}`);

    if (property.type.isCollection || property.defaultValue) {
        writer.write(` = ${propertyUtil.propertyToInstantiationString(property)}`);
    }

    writer.write(`;`);
    writer.newLine();
}