
import * as apiscript from 'apiscript';
import * as transform from '../util/text-transformers';
import * as propertyUtil from '../util/property-util';

import {API, PropertyType, ListPropertyType, SetPropertyType, MapPropertyType} from "apiscript";
import {TypescriptWriter} from "./typescript-writer";

export function writeHandlerClasses(api: API, libDir: string, mainWriter: TypescriptWriter) {

    api.forEachEndpoint((endpoint) => {
        let url = transform.urlToDash(endpoint.url);
        let fileName = `${url}-${apiscript.RequestMethod[endpoint.requestMethod].toLowerCase()}`;
        let method = apiscript.RequestMethod[endpoint.requestMethod].toLowerCase();

        let subURL = endpoint.url.substring(api.name.length + 1);

        mainWriter.indent();
        mainWriter.write(`router.${method}('/${subURL}', ${transform.urlToCamel(endpoint.url)});`);
        mainWriter.newLine();

        let writer = new TypescriptWriter(`${libDir}/handler/${fileName}.ts`);
        writer.newLine();

        writer.write(`import {parseNumber, parseBoolean, parseString} from "../core/parse-util";`);
        writer.newLine();

        writer.write(`import {parseList, parseSet, parseMap} from "../core/parse-util";`);
        writer.newLine();

        writer.write(`import {Request as ExpressRequest, Response as ExpressResponse} from "express";`);
        writer.newLine(2);

        writer.write(`import {Request} from "../request/${fileName}";`);
        writer.newLine();

        writer.write(`import {Response} from "../response/${fileName}";`);
        writer.newLine();

        writer.write(`import endpoint from "../../api/${fileName}";`);
        writer.newLine(2);

        let importCount = endpoint.bodyType ? writeParseImports(writer, endpoint.bodyType) : 0;
        importCount += endpoint.respondType ? writeParseImports(writer, endpoint.respondType) : 0;

        if (importCount > 0) { writer.newLine(); }

        writer.write(`export default function handle(expressRequest: ExpressRequest, expressResponse: ExpressResponse) `);
        writer.openClosure();
        writer.newLine();

        writer.indent();
        writer.write(`let request = new Request();`);
        writer.newLine();

        writer.indent();
        writer.write(`let response = new Response();`);
        writer.newLine(2);

        // endpoint only supports closure of primitive values for requestType
        if (endpoint.requestType) {

            endpoint.requestType.asClosure.forEachProperty((property) => {
                if (!property.isOptional && !property.defaultValue) {

                    // only add the error response, if not response has been set i.e no error has already occurred
                    writer.indent();
                    writer.write(`if (!response.hasResponse && !expressRequest.query.${property.name}) { response.error('${property.name} is missing'); }`);
                    writer.newLine();
                }
            });
            writer.newLine();

            endpoint.requestType.asClosure.forEachProperty((property) => {
                writer.indent();
                writer.write(`request.parameter.${property.name} = expressRequest.query.${property.name};`);
                writer.newLine();
            });
            writer.newLine();
        }

        if (endpoint.bodyType) {
            let type = endpoint.bodyType;
            writer.indent();

            writer.write(`try `);
            writer.openClosure();
            writer.newLine();

            writer.indent();
            writer.write(`expressRequest.body = `);

            if (type.asPrimitive) {
                writer.write(`expressRequest.body`);
            } else if (type.asCustom) {
                writer.write(`parse${transform.dashToPascal(type.asCustom.type)}(expressRequest.body)`);
            } else if (type.asCollection) {
                writeParseEntity(type, writer);
                writer.write(`(expressRequest.body)`);
            }

            writer.write(`;`);
            writer.newLine();

            writer.subIndent();
            writer.closeClosure();
            writer.write(` catch (e) `);
            writer.openClosure();

            writer.newLine();
            writer.indent();
            writer.write(`response.error(e.message);`);
            writer.newLine();

            writer.subIndent();
            writer.closeClosure();
            writer.newLine(2);
        }

        writer.indent();
        writer.write(`if (!response.hasResponse) { endpoint(request, response); }`);
        writer.newLine(2);

        writer.indent();
        writer.write(`expressResponse.json(response.object);`);
        writer.newLine();

        writer.subIndent();
        writer.closeClosure();
        writer.close();
    });

}

function writeParseEntity(type: PropertyType, writer: TypescriptWriter) {

    if (type.asCustom) {
        writer.write(`parse${type}`);
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

export function writeParseImports(writer: TypescriptWriter, type: PropertyType): number {
    let importTypes = propertyUtil.calculatePropertyImports(type);

    importTypes.forEach((importType) => {
        writer.write(`import {parse${importType}} from "../parse/${transform.pascalToDash(importType)}";`);
        writer.newLine();
    });

    return importTypes.size;
}