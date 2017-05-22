
import * as apiscript from "apiscript";

export function calculatePropertyTypeNames(propertyType: apiscript.PropertyType, types = new Set<string>()): Set<string> {

    if (propertyType.isEntity) {
        let name = propertyTypeToString(propertyType);
        types.add(name);

    } else if (propertyType.isCollection) {

        if (propertyType.isList) {
            let list = propertyType as apiscript.ListPropertyType;
            calculatePropertyTypeNames(list.type, types);

        } else if (propertyType.isSet) {
            let set = propertyType as apiscript.SetPropertyType;
            calculatePropertyTypeNames(set.type, types);

        } else if (propertyType.isMap) {
            let map = propertyType as apiscript.MapPropertyType;
            calculatePropertyTypeNames(map.keyType, types);
            calculatePropertyTypeNames(map.valueType, types);
        }
    }

    return types;
}

export function propertyTypeToString(propertyType: apiscript.PropertyType): string {

    if (propertyType.isPrimitive) {

        if (propertyType.isInteger || propertyType.isFloat) {
            return "number";
        } else if (propertyType.isBoolean) {
            return "boolean";
        } else if (propertyType.isString) {
            return "string";
        }

    } else if (propertyType.isCollection) {

        if (propertyType.isList) {
            let list = propertyType as apiscript.ListPropertyType;
            return `${propertyTypeToString(list.type)}[]`;
        } else if (propertyType.isSet) {
            let set = propertyType as apiscript.SetPropertyType;
            let type = propertyTypeToString(set.type);

            return `Set<${type}>`;
        } else if (propertyType.isMap) {
            let map = propertyType as apiscript.MapPropertyType;
            let keyType = propertyTypeToString(map.keyType);
            let valueType = propertyTypeToString(map.valueType);

            return `Map<${keyType}, ${valueType}>`;
        }

    } else {
        return propertyType.toString();
    }
}

export function propertyToInstantiationString(property: apiscript.Property): string {
    let propertyType = property.type;

    if (propertyType.isPrimitive) {

        if (propertyType.isInteger || propertyType.isFloat) {
            return property.defaultValue;
        } else if (propertyType.isBoolean) {
            return property.defaultValue;
        } else if (propertyType.isString) {
            return `"${property.defaultValue}"`;
        }

    } else if (propertyType.isCollection) {

        if (propertyType.isList) {
            return `[]`;
        } else if (propertyType.isSet) {
            let set = propertyType as apiscript.SetPropertyType;
            let type = propertyTypeToString(set.type);

            return `new Set<${type}>()`;
        } else if (propertyType.isMap) {
            let map = propertyType as apiscript.MapPropertyType;
            let keyType = propertyTypeToString(map.keyType);
            let valueType = propertyTypeToString(map.valueType);

            return `new Map<${keyType}, ${valueType}>()`;
        }

    } else {
        return propertyType.toString();
    }

}

export function calculatePropertyImports(propertyHolder: apiscript.Entity | apiscript.Endpoint): Set<string> {
    let importTypes = new Set<string>();

    propertyHolder.forEachProperty((property) => {
        let typeNames = calculatePropertyTypeNames(property.type);

        typeNames.forEach((value) => {
            importTypes.add(value);
        });
    });

    return importTypes;
}