
import * as apiscript from "apiscript";
import * as transform from "../util/text-transformers";
import * as propertyUtil from "../util/property-util";

import {API} from "apiscript";
import {TypescriptWriter} from "./typescript-writer";

export function writeResponseClasses(api: API, libDir: string) {

    api.forEachEndpoint((endpoint) => {
        let url = transform.urlToDash(endpoint.url);
        let fileName = `${url}-${apiscript.requestMethodToString(endpoint.requestMethod).toLowerCase()}`;

        let writer = new TypescriptWriter(`${libDir}/response/${fileName}.ts`);
        writer.newLine();

        let returnType = endpoint.returnType;
        let inheritanceType: string;

        if (returnType == null) {
            inheritanceType = 'SuccessResponse';
        } else if (returnType.isPrimitive) {

            if (returnType.isInteger) { inheritanceType = 'IntegerResponse'; }
            if (returnType.isFloat) { inheritanceType = 'FloatResponse'; }
            if (returnType.isBoolean) { inheritanceType = 'BooleanResponse'; }
            if (returnType.isString) { inheritanceType = 'StringResponse'; }

        } else if (returnType.isEntity || returnType.isCollection) {
            let propertyTypes = propertyUtil.calculatePropertyTypeNames(returnType);

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

        if (returnType != null && (returnType.isEntity || returnType.isCollection)) {
            writer.newLine(2);
            writer.indent();

            let returnString = propertyUtil.propertyTypeToString(returnType);
            let fieldName = returnType.isEntity ? transform.pascalToCamel(returnString) : 'values';

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