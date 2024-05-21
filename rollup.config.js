//@ts-check

exports.default = {
    input: './src/index.js',
    output: {
        file: './cjs/index.js',
        format: 'cjs',
        exports: "named"
    },
    onwarn(warning) {
        if (warning.code == 'UNRESOLVED_IMPORT' && ~['fs', 'path'].indexOf(warning.exporter)) {
            return
        }
        console.log(`${warning.message} (${warning.url})`)        
    }
};