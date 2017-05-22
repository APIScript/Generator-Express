
import {API, Entity, PropertyType, ListPropertyType, SetPropertyType, MapPropertyType} from "apiscript";
import {TypescriptWriter} from "./typescript-writer";

import * as propertyWriter from "../writer/property-writer";
import * as propertyUtil from "../util/property-util";
import * as transform from "../util/text-transformers";

export function writeEntityClasses(api: API, libDir: string) {

    api.forEachEntity((entity) => {

        let name = entity.name;
        let fileName = transform.pascalToDash(name);

        console.log(`Generating entity ${entity.name}`);

        writeEntityClass(entity, libDir, name, fileName);
        writeParseFunction(entity, libDir, name, fileName);
    });
}

function writeEntityClass(entity: Entity, libDir: string, name: string, fileName: string) {

    let writer = new TypescriptWriter(`${libDir}/entity/${fileName}.ts`);
    writer.newLine();

    let importCount = propertyWriter.writePropertyImports('.', writer, entity);
    if (importCount > 0) { writer.newLine(); }

    if (entity.inherits) {
        writer.write(`import {${entity.inherits}} from './${transform.pascalToDash(entity.inherits)}';`);
        writer.newLine(2);
        writer.write(`export class ${name} extends ${entity.inherits} `);
    } else {
        writer.write(`export class ${name} `);
    }

    writer.openClosure();
    writer.newLine();

    entity.forEachProperty((property) => {
        propertyWriter.writeProperty(writer, property);
    });

    writer.closeClosure();
    writer.close();
}

function writeParseFunction(entity: Entity, libDir: string, name: string, fileName: string) {

    let writer = new TypescriptWriter(`${libDir}/parse/${fileName}.ts`);
    writer.newLine();

    let fieldName = transform.pascalToCamel(name);

    writer.write(`import {${name}} from '../entity/${fileName}';`);
    writer.newLine();

    writer.write(`import {parseNumber, parseBoolean, parseString} from '../core/parse-util';`);
    writer.newLine();

    writer.write(`import {parseList, parseSet, parseMap} from '../core/parse-util';`);
    writer.newLine();

    let importTypes = propertyUtil.calculatePropertyImports(entity);
    importTypes.forEach((type) => {
        writer.write(`import {parse${type}} from './${transform.pascalToDash(type)}';`);
        writer.newLine();
    });

    writer.newLine();

    writer.write(`export function parse${name} (body: any): ${name} `);
    writer.openClosure();
    writer.newLine();

    writer.indent();
    writer.write(`let ${fileName} = new ${name}();`);
    writer.newLine(2);

    entity.forEachProperty((property) => {
        if (!property.isOptional && !property.defaultValue) {

            writer.indent();
            writer.write(`if (!body.${property.name}) { throw new Error('${name}.${property.name} is missing'); }`);
            writer.newLine();
        }
    });
    writer.newLine();

    entity.forEachProperty((property) => {
        writer.indent();
        let type = property.type;

        if (type.isEntity || type.isCollection) {
            writer.newLine();

            writer.indent();
            writer.write(`if (body.${property.name}) `);
            writer.openClosure();
            writer.newLine();

            writer.indent();

            if (type.isEntity) {
                writer.write(`${fileName}.${property.name} = parse${type}(${property.name});`);
            } else if (type.isCollection) {

                writer.write(`${fileName}.${property.name} = `);
                writeParseEntity(type, writer);
                writer.write(`(body.${property.name});`);
            }

            writer.newLine();
            writer.subIndent();
            writer.closeClosure();

        } else {
            writer.write(`${fileName}.${property.name} = body.${property.name};`);
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

    if (type.isEntity) {
        writer.write(`parse${type}`);
    } else if (type.isCollection) {

        if (type.isList) {
            let list = type as ListPropertyType;

            writer.write('parseList(');
            writeParseEntity(list.type, writer);
            writer.write(')');

        } else if (type.isSet) {
            let set = type as SetPropertyType;

            writer.write('parseSet(');
            writeParseEntity(set.type, writer);
            writer.write(')');

        } else if (type.isMap) {
            let map = type as MapPropertyType;

            writer.write('parseMap(');
            writeParseEntity(map.keyType, writer);
            writer.write(', ');
            writeParseEntity(map.valueType, writer);
            writer.write(')');
        }

    } else if (type.isPrimitive) {

        if (type.isInteger || type.isFloat) {
            writer.write(`parseNumber`);
        } else if (type.isBoolean) {
            writer.write(`parseBoolean`);
        } else if (type.isString) {
            writer.write(`parseString`);
        }
    }
}