
import * as apiscript from 'apiscript';
import * as transform from '../util/text-transformers';
import * as propertyUtil from "../util/property-util";
import * as propertyWriter from "./property-writer";

import {API} from "apiscript";
import {TypescriptWriter} from "./typescript-writer";

export function writeRequestClasses(api: API, libDir: string) {

    api.forEachEndpoint((endpoint) => {
        let url = transform.urlToDash(endpoint.url);
        let fileName = `${url}-${apiscript.RequestMethod[endpoint.requestMethod].toLowerCase()}`;

        let writer = new TypescriptWriter(`${libDir}/request/${fileName}.ts`);
        writer.newLine();

        let importCount = 0;
        if (endpoint.bodyType) { importCount += propertyWriter.writePropertyImports('../entity', writer, endpoint.bodyType); }
        if (endpoint.respondType) { importCount += propertyWriter.writePropertyImports('../entity', writer, endpoint.respondType); }
        if (importCount > 0) { writer.newLine(); }

        writer.write('export class Request ');
        writer.openClosure();
        writer.newLine();

        writer.indent();
        writer.write('public parameter = new Parameters();');
        writer.newLine();

        if (endpoint.requestType) {
            writer.indent();
            writer.write(`public body: ${propertyUtil.propertyTypeToString(endpoint.requestType)};`);
            writer.newLine();
        }
        writer.closeClosure();
        writer.newLine(2);

        writer.write('export class Parameters ');
        writer.openClosure();
        writer.newLine();

        if (endpoint.requestType) {
            endpoint.requestType.asClosure.forEachProperty((property) => {
                propertyWriter.writeProperty(writer, property);
            });
        }

        writer.closeClosure();
        writer.newLine();

        writer.close();
    });

}