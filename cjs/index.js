'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fs = require('fs');
var path = require('path');

//@ts-check



const hashB64 = Buffer.from((Math.random().toString().slice(2))).toString('base64').slice(0, 6);

/**
 * 
 * @param {{
 *  template: string,
 *  dest?: string,
 *  hashBy?: 'time'|'file'
 *  hash: boolean
 * }} options 
 * @returns 
 */
function htmlInliner({ template, dest, hash, hashBy }) {
    return {
        name: 'html-inline',
        /**
         * @param {{ file: string; dir: string | undefined }} options
         * @param {{ [x: string]: { code?: string; fileName: string; source: string } }} bundle
         * @this {import('rollup').PluginContext}
         */
        generateBundle(options, bundle) {

            debugger

            const targetDir = options.dir || path.dirname(options.file);

            if (hash && fs.existsSync(targetDir)) {
                fs.rmSync(targetDir, { recursive: true });
            }

            let templateContent = fs.readFileSync(template, 'utf-8');


            if (options.file) {
                if (path.extname(options.file) == '.html') ;
            }
            debugger

            Object.keys(bundle).forEach(fileName => {
                const { name, ext } = path.parse(fileName);

                const pattern = (name + '.[hash]' + ext);

                let hashSalt = hashBy == 'file'
                    ? (bundle[fileName].code || bundle[fileName].source).length.toString()
                    : hashB64;

                const fixedName = pattern.replace('[hash]', hashSalt);

                templateContent = templateContent.replace(pattern, () => {
                    return fixedName
                });
                bundle[fixedName] = bundle[fileName];
                bundle[fixedName].fileName = fixedName;

                debugger

                Reflect.deleteProperty(bundle, fileName);
            });

            if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

            fs.writeFileSync(path.join(targetDir, (dest || 'index.html')), templateContent);

            debugger
            // const file = path.parse(options.file).base
            // const code = bundle[file].code
            // bundle[file].code = templateContent.replace('%%script%%', () => code)
        }
    }
}

exports.default = htmlInliner;
exports.htmlInliner = htmlInliner;
