
export interface Response {
    readonly object: any;
}

export abstract class BasicResponse implements Response {

    private _object: any;

    public get object(): any {
        if (!this._object) { return { error: 'The endpoint failed to respond.' }; }
        return this._object;
    }

    protected set response(value: any) {
        if (this._object) { throw new Error('The response value has already been set.'); }
        this._object = value;
    }

    public get hasResponse(): boolean {
        return this._object != null;
    }

    public error(message: string) {
        this._object = { error: message };
    }
}

export class IntegerResponse extends BasicResponse {

    public value(value: number) {
        if (value % 1 !== 0) { throw new Error('The value must be an integer.'); }
        this.response = { integer: value };
    }
}

export class FloatResponse extends BasicResponse {

    public value(value: number) {
        this.response = { float: value };
    }
}

export class StringResponse extends BasicResponse {

    public value(value: string) {
        this.response = { string: value };
    }
}

export class BooleanResponse extends BasicResponse {

    public value(value: boolean) {
        this.response = { boolean: value };
    }
}

export class SuccessResponse extends BasicResponse {

    public success(message?: string) {

        if (message) {
            this.response = { success: message };
        } else {
            this.response = { success: "The endpoint reported success." };
        }
    }
}