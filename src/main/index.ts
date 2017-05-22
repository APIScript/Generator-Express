
import * as fs from "fs";
import * as path from "path";
import * as del from "del";
import * as apiscript from "apiscript";
import * as shell from "shelljs";

import {writeEntityClasses} from "./writer/entity-writer";
import {writeEnumClasses} from "./writer/enum-writer";
import {writeIndexClass} from "./writer/index-writer";

export class ExpressGenerator implements apiscript.Generator {

    generate(api: apiscript.API, config: apiscript.Config) {

        // get the build dirs from config if available
        let buildDir = config.buildDir ? config.buildDir : 'build';
        let libDir = buildDir + '/' + (config.libDir ? config.libDir : 'apiscript');
        let apiDir = buildDir + '/' + (config.apiDir ? config.apiDir : 'api');

        // remove old lib directory
        if (fs.existsSync(libDir)) { del.sync(libDir); }

        // write enums and entities
        writeEnumClasses(api, libDir);
        writeEntityClasses(api, libDir);

        // write index class
        writeIndexClass(api, libDir, apiDir);

        // get inject dir
        let injectDir = path.resolve(__dirname, '/inject');
        if (!fs.existsSync(injectDir)) { injectDir = path.resolve(__dirname, '../../src/inject'); }

        // make inject output dir
        shell.mkdir(libDir + '/core/');

        // copy inject files
        fs.readdirSync(injectDir).forEach(file => {
            shell.cp(injectDir + '/' + file, libDir + '/core/' + file);
        });

        console.log('Generation complete!');
    }
}

let instance = new ExpressGenerator();
module.exports = instance;