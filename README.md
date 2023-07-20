# esbuild-plugin-template

Emit templated files at the end of an Esbuild run.

## Usage

```js
import htmlPlugin from 'esbuild-plugin-template'

plugins: [
    htmlPlugin([{ filename, templateStringOrFn }])
]
```

If templateStringOrFn is a function it is passed `esbuildResult, esbuildInitialOptions` and must return a string.

If templateStringOrFn is a string `<--js-->` and `<--css-->` are replaced with all emitted js and css files.

If templateStringOrFn is undefefined it is set to a default string for HTML that templates JS and CSS.

If no arguments are passed, a default of `[{ filename = 'index.html' }]` is used.
