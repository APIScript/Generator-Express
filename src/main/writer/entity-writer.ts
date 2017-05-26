
import {API, Entity, PropertyType, ListPropertyType, SetPropertyType, MapPropertyType} from "apiscript";
import {TypescriptWriter} from "./typescript-writer";

import * as propertyWriter from "../writer/property-writer";
import * as propertyUtil from "../util/property-util";
import * as transform from "../util/text-transformers";

export function writeEntityClasses(api: API, libDir: string) {

    api.forEachEntity((entity) => {
        let name = transform.dashToPascal(entity.name);
        let fileName = entity.name;

        console.log(`Generating entity ${name}`);

        writeEntityClass(entity, libDir, name, fileName);
        writeParseFunction(entity, libDir, name, fileName);
    });
}

function writeEntityClass(entity: Entity, libDir: string, name: string, fileName: string) {

    let writer = new TypescriptWriter(`${libDir}/entity/${fileName}.ts`);
    writer.newLine();

    let importCount = propertyWriter.writePropertyImports('.', writer, entity.closure);
    if (importCount > 0) { writer.newLine(); }

    if (entity.inherits) {
        writer.write(`import {${transform.dashToPascal(entity.inherits)}} from './${entity.inherits}';`);
        writer.newLine(2);
        writer.write(`export class ${name} extends ${transform.dashToPascal(entity.inherits)} `);
    } else {
        writer.write(`export class ${name} `);
    }

    writer.openClosure();
    writer.newLine();

    entity.closure.forEachProperty((property) => {
        propertyWriter.writeProperty(writer, property);
    });

    writer.closeClosure();
    writer.close();
}

function writeParseFunction(entity: Entity, libDir: string, name: string, fileName: string) {

    let writer = new TypescriptWriter(`${libDir}/parse/${fileName}.ts`);
    writer.newLine();

    let fieldName = transform.dashToCamel(fileName);

    writer.write(`import {${name}} from '../entity/${fileName}';`);
    writer.newLine();

    writer.write(`import {parseNumber, parseBoolean, parseString} from '../core/parse-util';`);
    writer.newLine();

    writer.write(`import {parseList, parseSet, parseMap} from '../core/parse-util';`);
    writer.newLine();

    let importTypes = propertyUtil.calculatePropertyImports(entity.closure);
    importTypes.forEach((type) => {
        writer.write(`import {parse${type}} from './${transform.pascalToDash(type)}';`);
        writer.newLine();
    });

    writer.newLine();

    writer.write(`export function parse${name} (body: any): ${name} `);
    writer.openClosure();
    writer.newLine();

    writer.indent();
    writer.write(`let ${fieldName} = new ${name}();`);
    writer.newLine(2);

    entity.closure.forEachProperty((property) => {
        if (!property.isOptional && !property.defaultValue) {

            writer.indent();
            writer.write(`if (!body.${property.name}) { throw new Error('${name}.${property.name} is missing'); }`);
            writer.newLine();
        }
    });
    writer.newLine();

    entity.closure.forEachProperty((property) => {
        writer.indent();
        let type = property.type;

        if (type.asCustom || type.asCollection) {
            writer.newLine();

            writer.indent();
            writer.write(`if (body.${property.name}) `);
            writer.openClosure();
            writer.newLine();

            writer.indent();

            if (type.asCustom) {
                writer.write(`${fieldName}.${property.name} = ` +
                    `parse${transform.dashToPascal(type.asCustom.type)}(${property.name});`);

            } else if (type.asCollection) {

                writer.write(`${fieldName}.${property.name} = `);
                writeParseEntity(type, writer);
                writer.write(`(body.${property.name});`);
            }

            writer.newLine();
            writer.subIndent();
            writer.closeClosure();

        } else {
            writer.write(`${fieldName}.${property.name} = body.${property.name};`);
        }

        writer.newLine();
    });
    writer.newLine();

    writer.indent();
    writer.write(`return ${fieldName};`);
    writer.newLine();

    writer.subIndent();
    writer.closeClosure();
    writer.close();
}

function writeParseEntity(type: PropertyType, writer: TypescriptWriter) {

    if (type.asCustom || type.asClosure) {
        writer.write(`parse${transform.dashToPascal(type.asCustom.type)}`);
    } else if (type.asCollection) {
        let collection = type.asCollection;

        if (collection.asList) {
            let list = type as ListPropertyType;

            writer.write('parseList(');
            writeParseEntity(list.type, writer);
            writer.write(')');

        } else if (collection.asSet) {
            let set = type as SetPropertyType;

            writer.write('parseSet(');
            writeParseEntity(set.type, writer);
            writer.write(')');

        } else if (collection.asMap) {
            let map = type as MapPropertyType;

            writer.write('parseMap(');
            writeParseEntity(map.keyType, writer);
            writer.write(', ');
            writeParseEntity(map.valueType, writer);
            writer.write(')');
        }

    } else if (type.asPrimitive) {
        let primitive = type.asPrimitive;

        if (primitive.asInteger || primitive.asFloat) {
            writer.write(`parseNumber`);
        } else if (primitive.asBoolean) {
            writer.write(`parseBoolean`);
        } else if (primitive.asString) {
            writer.write(`parseString`);
        }
    }
}