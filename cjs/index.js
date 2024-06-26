'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fs = require('fs');
var path = require('path');

//@ts-check


// based on the branch https://stackoverflow.com/questions/61565251/output-single-html-file-from-svelte-project



const hashB64 = Buffer.from((Math.random().toString().slice(2))).toString('base64').slice(0, 6);

/**
 * 
 * @param {{
 *  template: string,
 *  dest?: string,
 *  hashBy?: 'time'|'file'
 *  hash: boolean,
 *  cleanExclude?: string[],
 *  clean?: boolean,
 *  resourcesDirectory?: string
 * }} options 
 * @returns 
 */
function htmlInliner({ template, dest, hash, hashBy, cleanExclude, resourcesDirectory, clean = true}) {
    return {
        name: 'html-inline',
        /**
         * @param {{ file: string; dir: string | undefined }} options
         * @param {{ [x: string]: { code?: string; fileName: string; source: string } }} bundle
         * @this {import('rollup').PluginContext}
         */
        generateBundle(options, bundle) {
                    
            if (!dest) {
                if (options.file && path.extname(options.file) == '.html') {
                    dest = path.basename(options.file);
                }
                else {
                    dest = 'index.html';
                }
            }

            const targetFilenames = Object.keys(bundle);

            const targetDir = options.dir || path.dirname(options.file);

            const targetHtmlPath = path.join(targetDir, dest);
            

            if (fs.existsSync(targetDir)) {
                if (hash) {
                    removeFiles(targetDir, cleanExclude);
                }
                else if (fs.existsSync(targetHtmlPath)) {

                    const existingHtmlContent = fs.readFileSync(targetHtmlPath, 'utf-8');

                    const asExpected = targetFilenames
                        .map(name => existingHtmlContent.match(new RegExp('[\'"]' + name + '[\'"]')))
                        .filter(Boolean)
                        .length == targetFilenames.length;

                    if (!asExpected) {
                        clean && removeFiles(targetDir, cleanExclude);
                    }
                    else {                        
                        return; // nothing to do
                    }
                }
            }

            let templateContent = fs.readFileSync(template, 'utf-8');       

            targetFilenames.forEach(fileName => {
                const { name, ext } = path.parse(fileName);

                const pattern = (name + '.[hash]' + ext);

                if (hash) {
                    let hashSalt = hashBy == 'file'
                        ? (bundle[fileName].code || bundle[fileName].source).length.toString()
                        : hashB64;

                    let fixedName = pattern.replace('[hash]', hashSalt);

                    templateContent = templateContent.replace(pattern, () => {
                        return fixedName
                    });

                    if (resourcesDirectory) {
                        fixedName = resourcesDirectory + fixedName;
                    }

                    bundle[fixedName] = bundle[fileName];
                    bundle[fixedName].fileName = fixedName;

                    Reflect.deleteProperty(bundle, fileName);
                }
                else {

                    templateContent = templateContent.replace(pattern, () => {
                        return fileName
                    });
                }
            });
            
            if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

            fs.writeFileSync(targetHtmlPath, templateContent);

        }
    }
}


function removeFiles(dir, exclude) {
    if (!exclude) fs.rmSync(dir, { recursive: true });
    else {
        const persistentFiles = new Set(exclude);
        fs.readdirSync(dir).filter(f => !persistentFiles.has(f)).forEach(file => {
            fs.rmSync(file);
        });
    }
}

exports.default = htmlInliner;
exports.htmlInliner = htmlInliner;
