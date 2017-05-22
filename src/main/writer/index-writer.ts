
import {API} from "apiscript";
import {TypescriptWriter} from "./typescript-writer";

import {writeRequestClasses} from "./request-writer";
import {writeResponseClasses} from "./response-writer";
import {writeEndpointClasses} from "./endpoint-writer";
import {writeHandlerClasses} from "./handler-writer";

import * as apiscript from 'apiscript';
import * as transform from "../util/text-transformers";

export function writeIndexClass(api: API, libDir: string, apiDir: string) {

    let writer = new TypescriptWriter(`${libDir}/apiscript.ts`);
    writer.newLine();

    writer.write('import {Express, Router} from "express";');
    writer.newLine();

    writer.write('import * as bodyParser from "body-parser";');
    writer.newLine(2);

    api.forEachEndpoint((endpoint) => {
        let url = transform.urlToDash(endpoint.url);
        let functionName = transform.urlToCamel(endpoint.url);
        let fileName = `${url}-${apiscript.requestMethodToString(endpoint.requestMethod).toLowerCase()}`;

        writer.write(`import ${functionName} from "./handler/${fileName}";`);
        writer.newLine();
    });
    writer.newLine(1);

    writeRequestClasses(api, libDir);
    writeResponseClasses(api, libDir);
    writeEndpointClasses(api, apiDir);

    writer.write(`export default function (app: Express) `);
    writer.openClosure();
    writer.newLine();

    writer.indent();
    writer.write(`let router = Router();`);
    writer.newLine(2);

    writeHandlerClasses(api, libDir, writer);
    writer.newLine();

    writer.indent();
    writer.write(`router.use('/', (request, response) => `);
    writer.openClosure();
    writer.newLine();

    writer.indent();
    writer.write(`response.json({ error: 'Invalid API Endpoint' });`);
    writer.newLine();

    writer.subIndent();
    writer.closeClosure();
    writer.write(`);`);
    writer.newLine(2);

    writer.indent();
    writer.write(`app.use(bodyParser.json());`);
    writer.newLine(1);

    writer.indent();
    writer.write(`app.use('/${api.name}', router);`);
    writer.newLine(1);

    writer.closeClosure();
    writer.close();
}