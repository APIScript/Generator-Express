
/*function isUpperCase(value: string): boolean {
    return value.toUpperCase() === value;
}

function isLowerCase(value: string): boolean {
    return !isUpperCase(value);
}

export function urlToUnderscore(url: string) {
    return url.replace(/\//g, '_');
}

export function urlToCamel(url: string): string {
    if (url.length < 1) { return url; }
    let result = (url.charAt(0) === '/') ? '' : url.charAt(0);

    for (let i = 1; i < url.length; i++) {
        let lastCharacter = url.charAt(i - 1);
        let character = url.charAt(i);

        if (character !== '/') {
            result += (lastCharacter === '/') ? character.toUpperCase() : character;
        }
    }

    return result;
}

function pascalTransform(value: string, transform: string): string {
    let result = "";
    let wasLastCharacterLower = false;

    for (let i = 0; i < value.length; i++) {
        let character = value.charAt(i);
        let isCharacterLower = isLowerCase(character);

        if (wasLastCharacterLower && !isCharacterLower) {
            if (i != value.length - 1) { result += transform; }
        }

        result += character.toLowerCase();
        wasLastCharacterLower = isCharacterLower;
    }

    return result;
}

export function pascalToDash(value: string): string {
    return pascalTransform(value, '-');
}

export function pascalToUnderscore(value: string): string {
    return pascalTransform(value, '_');
}

export function pascalToCamel(value: string): string {
    if (value.length > 0) { return value.substring(0, 1).toLowerCase() + value.substring(1); }
    return value;
}*/

export function urlToDash(url: string) {
    return url.replace(/\//g, '-');
}

export function urlToCamel(url: string): string {
    return dashToCamel(urlToDash(url));
}

export function dashToPascal(value: string): string {

    if (value.length < 1) { return value; }
    let result = value.substring(0, 1).toUpperCase();

    for (let i = 1; i < value.length; i++) {
        let character = value.charAt(i);
        let lastCharacter = value.charAt(i - 1);

        if (character === '-') { continue; }

        if (lastCharacter === '-') {
            result += character.toUpperCase();
        } else {
            result += character.toLowerCase();
        }
    }

    return result;
}

export function dashToCamel(value: string): string {

    if (value.length < 1) { return value; }
    let result = value.substring(0, 1).toLowerCase();

    for (let i = 1; i < value.length; i++) {
        let character = value.charAt(i);
        let lastCharacter = value.charAt(i - 1);

        if (character === '-') { continue; }

        if (lastCharacter === '-') {
            result += character.toUpperCase();
        } else {
            result += character.toLowerCase();
        }
    }

    return result;
}

function pascalTransform(value: string, transform: string): string {
    let result = "";
    let wasLastCharacterLower = false;

    for (let i = 0; i < value.length; i++) {
        let character = value.charAt(i);
        let isCharacterLower = isLowerCase(character);

        if (wasLastCharacterLower && !isCharacterLower) {
            if (i != value.length - 1) { result += transform; }
        }

        result += character.toLowerCase();
        wasLastCharacterLower = isCharacterLower;
    }

    return result;
}

export function pascalToDash(value: string): string {
    return pascalTransform(value, '-');
}

function isUpperCase(value: string): boolean {
    return value.toUpperCase() === value;
}

function isLowerCase(value: string): boolean {
    return !isUpperCase(value);
}