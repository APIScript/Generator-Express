
import * as fs from "fs";
import * as shell from "shelljs";

import {WriteStream} from "fs";

export class TypescriptWriter {

    private readonly indentation = '    ';
    private closureIndex = 0;

    private stream: WriteStream;

    public constructor(file: string) {
        shell.mkdir('-p', file.replace(/[a-zA-Z0-9-]+\.ts$/, ''));
        this.stream = fs.createWriteStream(file);
    }

    public openClosure() {
        this.write('{');
        this.closureIndex++;
    }

    public closeClosure() {
        this.closureIndex--;

        if (this.closureIndex < 0) {
            throw new Error('Too many closures have been closed');
        }

        this.write('}');
    }

    public newLine(amount: number = 1) {
        for (let i = 0; i < amount; i++) { this.write('\n'); }
    }

    private writeIndent(amount: number) {
        for (let i = 0; i < amount; i++) { this.write(this.indentation); }
    }

    public indent() {
        this.writeIndent(this.closureIndex);
    }

    public subIndent() {
        this.writeIndent(this.closureIndex - 1);
    }

    public write(data: any) {
        if (this.stream == null) {
            throw new Error('Writer already closed');
        }

        this.stream.write(data);
    }

    public close() {
        this.stream.end();
        this.stream = null;
    }

}