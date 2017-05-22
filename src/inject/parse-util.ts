
// takes a number and returns it, used for parsing collections
export function parseNumber(data: number): number {
    return data;
}

// takes a boolean and returns it, used for parsing collections
export function parseBoolean(data: boolean): boolean {
    return data;
}

// takes a string and returns it, used for parsing collections
export function parseString(data: string): string {
    return data;
}

// takes a parse function of type T and returns a function that parses type T[]
export function parseList<T>(parse: (data) => T): (data) => T[] {

    return (data) => {
        let result: T[] = [];

        data.forEach((data) => {
            result.push(parse(data));
        });

        return result;
    };
}

// takes a parse function of type T and returns a function that parses type Set<T>
export function parseSet<T>(parse: (data) => T): (data) => Set<T> {

    return (data) => {
        let result = new Set<T>();

        data.forEach((data) => {
            result.add(parse(data));
        });

        return result;
    };
}

// takes two parse functions of type K and V and returns a function that parses type Map<K, V>
export function parseMap<K, V>(parseKey: (data) => K, parseValue: (data) => V): (data) => Map<K, V> {

    return (data) => {
        let result = new Map<K, V>();

        data.forEach((data) => {
            result.set(parseKey(data[0]), parseValue(data[1]));
        });

        return result;
    };
}