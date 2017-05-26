
import * as apiscript from "apiscript";
import * as transform from "./text-transformers";

export function calculatePropertyTypeNames(propertyType: apiscript.PropertyType, types = new Set<string>()): Set<string> {

    if (propertyType.asCustom) {
        let name = propertyTypeToString(propertyType);
        types.add(name);

    } else if (propertyType.asCollection) {
        let collection = propertyType.asCollection;

        if (collection.asList) {
            let list = propertyType as apiscript.ListPropertyType;
            calculatePropertyTypeNames(list.type, types);

        } else if (collection.asSet) {
            let set = propertyType as apiscript.SetPropertyType;
            calculatePropertyTypeNames(set.type, types);

        } else if (collection.asMap) {
            let map = propertyType as apiscript.MapPropertyType;
            calculatePropertyTypeNames(map.keyType, types);
            calculatePropertyTypeNames(map.valueType, types);
        }
    } else if (propertyType.asClosure) {
        let closure = propertyType.asClosure;

        closure.forEachProperty((property) => {
            calculatePropertyTypeNames(property.type, types);
        });
    }

    return types;
}

export function propertyTypeToString(propertyType: apiscript.PropertyType): string {

    if (propertyType.asPrimitive) {
        let primitive = propertyType.asPrimitive;

        if (primitive.asInteger || primitive.asFloat) {
            return "number";
        } else if (primitive.asBoolean) {
            return "boolean";
        } else if (primitive.asString) {
            return "string";
        }

    } else if (propertyType.asCollection) {
        let collection = propertyType.asCollection;

        if (collection.asList) {
            let list = propertyType as apiscript.ListPropertyType;
            return `${propertyTypeToString(list.type)}[]`;
        } else if (collection.asSet) {
            let set = propertyType as apiscript.SetPropertyType;
            let type = propertyTypeToString(set.type);

            return `Set<${type}>`;
        } else if (collection.asMap) {
            let map = propertyType as apiscript.MapPropertyType;
            let keyType = propertyTypeToString(map.keyType);
            let valueType = propertyTypeToString(map.valueType);

            return `Map<${keyType}, ${valueType}>`;
        }

    } else if (propertyType.asClosure) {
        let result = '{ ';
        let closure = propertyType.asClosure;

        closure.forEachProperty((property, index) => {
            result += `${property.name}: ${propertyTypeToString(property.type)}`;
            if (index < closure.propertyCount - 1) { result += ', '; }
        });

        return result + ' }';

    } else {
        return transform.dashToPascal(propertyType.asCustom.type);
    }
}

export function propertyToInstantiationString(property: apiscript.Property): string {
    let propertyType = property.type;

    if (propertyType.asPrimitive) {
        let primitive = propertyType.asPrimitive;

        if (primitive.asInteger || primitive.asFloat) {
            return property.defaultValue;
        } else if (primitive.asBoolean) {
            return property.defaultValue;
        } else if (primitive.asString) {
            return `"${property.defaultValue}"`;
        }

    } else if (propertyType.asCollection) {
        let collection = propertyType.asCollection;

        if (collection.asList) {
            return `[]`;
        } else if (collection.asSet) {
            let set = propertyType as apiscript.SetPropertyType;
            let type = propertyTypeToString(set.type);

            return `new Set<${type}>()`;
        } else if (collection.asMap) {
            let map = propertyType as apiscript.MapPropertyType;
            let keyType = propertyTypeToString(map.keyType);
            let valueType = propertyTypeToString(map.valueType);

            return `new Map<${keyType}, ${valueType}>()`;
        }

    } else if (propertyType.asClosure) {
        let closure = propertyType.asClosure;
        let result = '{ ';

        closure.forEachProperty((property, index) => {
            result += `${property.name}: ${propertyToInstantiationString(property)}`;
            if (index < closure.propertyCount - 1) { result += ', '; }
        });

        return result + ' }';

    } else {
        return transform.dashToPascal(propertyType.asCustom.type)
    }
}

export function calculatePropertyImports(type: apiscript.PropertyType): Set<string> {
    let importTypes = new Set<string>();
    let typeNames = calculatePropertyTypeNames(type);

    typeNames.forEach((value) => {
        importTypes.add(value);
    });

    return importTypes;
}