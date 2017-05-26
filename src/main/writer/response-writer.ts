
import * as apiscript from "apiscript";
import * as transform from "../util/text-transformers";
import * as propertyUtil from "../util/property-util";

import {API} from "apiscript";
import {TypescriptWriter} from "./typescript-writer";

export function writeResponseClasses(api: API, libDir: string) {

    api.forEachEndpoint((endpoint) => {
        let url = transform.urlToDash(endpoint.url);
        let fileName = `${url}-${apiscript.RequestMethod[endpoint.requestMethod].toLowerCase()}`;

        let writer = new TypescriptWriter(`${libDir}/response/${fileName}.ts`);
        writer.newLine();

        let respondType = endpoint.respondType;
        let inheritanceType: string;

        if (respondType == null) {
            inheritanceType = 'SuccessResponse';
        } else if (respondType.asPrimitive) {
            let primitive = respondType.asPrimitive;

            if (primitive.asInteger) { inheritanceType = 'IntegerResponse'; }
            if (primitive.asFloat) { inheritanceType = 'FloatResponse'; }
            if (primitive.asBoolean) { inheritanceType = 'BooleanResponse'; }
            if (primitive.asString) { inheritanceType = 'StringResponse'; }

        } else if (respondType.asCustom || respondType.asCollection) {
            let propertyTypes = propertyUtil.calculatePropertyTypeNames(respondType);

            propertyTypes.forEach((type) => {
                writer.write(`import {${type}} from '../entity/${transform.pascalToDash(type)}';`);
                writer.newLine();
            });

            inheritanceType = 'BasicResponse';
        }

        writer.write(`import {${inheritanceType}} from '../core/response';`);
        writer.newLine(2);

        writer.write(`export class Response extends ${inheritanceType} `);
        writer.openClosure();

        if (respondType != null && (respondType.asCustom || respondType.asCollection)) {
            writer.newLine(2);
            writer.indent();

            let returnString = propertyUtil.propertyTypeToString(respondType);
            let fieldName = respondType.asCustom ? transform.dashToCamel(returnString) : 'values';

            writer.write(`public value(${fieldName}: ${returnString}) `);
            writer.openClosure();
            writer.newLine();

            writer.indent();
            writer.write(`this.response = ${fieldName};`);
            writer.newLine();

            writer.subIndent();
            writer.closeClosure();
            writer.newLine();
        }

        writer.closeClosure();
        writer.close();

    });

}