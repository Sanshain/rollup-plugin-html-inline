//@ts-check

import fs from "fs";
import path from "path";

// based on the branch https://stackoverflow.com/questions/61565251/output-single-html-file-from-svelte-project



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
export function htmlInliner({ template, dest, hash, hashBy }) {
    return {
        name: 'html-inline',
        /**
         * @param {{ file: string; dir: string | undefined }} options
         * @param {{ [x: string]: { code?: string; fileName: string; source: string } }} bundle
         * @this {import('rollup').PluginContext}
         */
        generateBundle(options, bundle) {

            // debugger

            const targetDir = options.dir || path.dirname(options.file);

            if (hash && fs.existsSync(targetDir)) {
                fs.rmSync(targetDir, { recursive: true })
            }

            let templateContent = fs.readFileSync(template, 'utf-8')


            if (options.file) {
                if (path.extname(options.file) == '.html') {
                    dest = path.basename(options.file);
                }
                else {                    
                    // dest is `index.html`
                }
            }

            Object.keys(bundle).forEach(fileName => {
                const { name, ext } = path.parse(fileName);

                const pattern = (name + '.[hash]' + ext)

                let hashSalt = hashBy == 'file'
                    ? (bundle[fileName].code || bundle[fileName].source).length.toString()
                    : hashB64;

                const fixedName = pattern.replace('[hash]', hashSalt);

                templateContent = templateContent.replace(pattern, () => {
                    return fixedName
                });
                bundle[fixedName] = bundle[fileName];
                bundle[fixedName].fileName = fixedName                

                Reflect.deleteProperty(bundle, fileName)
            })

            if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

            fs.writeFileSync(path.join(targetDir, (dest || 'index.html')), templateContent);
            
            // const file = path.parse(options.file).base
            // const code = bundle[file].code
            // bundle[file].code = templateContent.replace('%%script%%', () => code)
        }
    }
}

export default htmlInliner;