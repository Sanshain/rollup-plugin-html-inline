## rollup-plugin-html-inline

### About:

Generates an html file based on the specified template and inserts links to the generated scripts into it. 

This plugin is similar to [rollup-plugin-generate-html-template](https://www.npmjs.com/package/rollup-plugin-generate-html-template), but unlike it **rollup-plugin-html-inline** has the option to add a hash to the names of generated resources (as rollup can do through the `entryFileNames` and `assetFileNames` options) and to the resulting html file.

### Motivation: 

As we know, **rollup** has opportunity to add a hash to the names of compiled files using the `entryFileNames` and `assetFileName` options. It works great. But the method leads to unnecessary manual work, because in the final html file you have to manually change the paths to resources each time due to the changed hash. 

Unfortunately, the lack of such a feature out of the box, any generally accepted practice, and any documented API for extracting and managing a hash to make embedding it manually with minimal effort made these wonderful options useless to me. That's why I have thought about creating a plugin that can do html generation with links embedding solving the problem.

### Usage: 

#### Step  1: install

```sh
npm i rollup-plugin-html-inline -D
```

#### Step 2: create template

*./public/index.html:*

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preact App</title>
    <link rel="stylesheet" href="/styles.[hash].css" type="text/css">
</head>
<body>
    <div id="app"></div>
    <script async src="/main.[hash].js"></script>
</body>
</html>
```


#### Step 3: configure it

*rollup.config.js:*

```js
import css from 'rollup-plugin-css-only'
import { htmlInliner as inline } from 'rollup-plugin-html-inline';
// ...

const development = !!process.env.ROLLUP_WATCH

export default {
    input: './src/index.js',
    output: {
        dir: 'dist',
        format: 'iife',
    },
    plugins: [
        // ...
        css({ output: `styles.css`}),
        development && inline({
            template: './public/index.html',
            hash: true,
        }),        
    ]
```

#### Step 4: build it

```sh
rollup -c
```

#### Step 5: enjoy

Four previous steps will remove content of `dist` directory and generate in it three files from scratch



### Additional options: 

- `dest` option specifies html name. By default it uses `"index.html"` or input file if it has `.html` extension
- `hashBy` - hash type, which one will be applied to file names (by default it is 'time'). `file` value means hash based on content length (there is a little possibility to match with previous length, so `time` is more preferable).  Hash based on file content doesn't support yet (on start I've rejected the option in order not to pull an excess dependency)




