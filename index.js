const { writeFileSync } = require('fs')
const { join } = require('path')

const cssPlaceholder = '<!--css-->';
const jsPlaceholder = '<!--js-->';
const name = 'esbuild-plugin-template'
const defaultUserTemplate = `<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>${name}</title>
		${cssPlaceholder}
	</head>
	<body>
		<div id="root"></div>
		${jsPlaceholder}
	</body>
</html>`

function template(userTemplate, result, initialOptions) {
	if (userTemplate === undefined) userTemplate = defaultUserTemplate;
	if (typeof userTemplate === 'string') {
		const outputs = (Object.keys(result?.metafile?.outputs ?? []));
		const stripBase = f => f.replace(initialOptions.outdir, '');
		const stylesheets = outputs.filter(f => f.endsWith('.css')).map(stripBase);
		const scripts = outputs.filter(f => f.endsWith('.js')).map(stripBase);

		return userTemplate
			.replace(cssPlaceholder, stylesheets
				.map(f => `<link rel="stylesheet" href="${f}"></script>`)
				.join('\n')
			)
			.replace(jsPlaceholder, scripts
				.map(f => `<script src="${f}"></script>`)
				.join('\n')
			)
	} else if (typeof userTemplate === 'function') {
		return userTemplate(result, initialOptions)
	} else {
		return {
			errors: [{
				pluginName: name,
				text: 'template must be undefined, string, or function'
			}]
		};
	}
}

function templatePlugin(userTemplates = [{ filename: 'index.html' }]) {
	return {
		name,
		setup(build) {
			const { write, outdir, metafile } = build.initialOptions;

			build.onStart(() => {
				const warnings = [];
				const errors = [];
				if (write) {
					warnings.push({
						pluginName: name,
						text: 'incompatible with the in-memory file system. set write=false'
					})
				}
				if (!metafile) {
					errors.push({ pluginName: name, text: 'requires metafile=true' })
				}
				return { warnings, errors }
			})

			build.onEnd(result => {
				if (write) return;
				userTemplates.forEach(({ filename, template: userTemplate }) => {
					const html = template(userTemplate, result, build.initialOptions);
					if (typeof html === 'object') return html;
					writeFileSync(join(outdir, filename), html);
				});
			})
		},
	};
};

module.exports = templatePlugin
