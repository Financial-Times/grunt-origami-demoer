#grunt origami demoer

A grunt task to generate demo pages for your origami module.

## Config options

These options can be set once and will apply to all templates generated, unless overridden (see below).

### sass

Type: `String`
Default: `main.scss`

The demo's SASS file.

### js

Type: `String`
Default: `main.js`

The demo's JS file.

### scriptMode

Type: `string`
Default: `normal`

Can be `normal` for plain JS, or `browserify`. If it's `browserify`, then the following transforms will be used:
* [debowerify](https://github.com/eugeneware/debowerify)
* [brfs](https://github.com/substack/brfs)

### modernizr

Type: `Boolean`
Default: true

A custom `modernizr-custom.js` file is built based on the browser features declared in the `origami.json` file of the module and all it's dependencies.

The `modernizr` option specifies whether a demo page should include this file. If so, it's included in the HTML head.

### silentSass

Type: `Boolean`
Default: `false`

Whether to build the SASS with silent mode turned off.

### pageTemplate

Type: `String`
Default: `./node_modules/grunt-origami-demoer/templates/page.mustache`

The template to use for the outer HTML page.

### demoTemplate

Type: `String`
Default: `main.mustache`

The demo template to include inside the pageTemplate.

<!--
### demoRoot

Type: `String`
Default: `./demo-src`

The folder where demo templates, SASS and JS are expected to be (except for main.mustache, main.scss and main.js).
-->

### viewModel

Type: `Object`
Default: `{}`

Data to to be rendered in the demo template.

## Default demo file

If none of these options are set, and the module has a `main.mustache` template listed in its `Bower.json` file's `main` property, then a single demo file called main.html will be created. This will include:

* `main.css`, if a `main.scss` is listed in the Bower `main` property.
* `main.js`, if a `main.js` is listed in the Bower `main` property.

## Demo templates

In addition to the `options` listed above, a `demos` property can also be set, which will list demo pages to be generated, keyed by a name that will be used for the resulting HTML file. For each entry in this object, overrides can be set for any of the above options.

For example:

    'origami-demo': {
      'demos': {
        'demo1': {
            'template': 'demo1.mustache',
            'sass': 'demo/demo1.scss',
            'js': 'demo/demo1.js'
        },
        'demo2': {
            'template': "demo2.mustache",
            'sass': "demo/demo2.css",
            'js': ["demo-common.js", "demo2.js"],
            'pageTemplate': "demo-page.mustache",
            'silentSass': true
        }
      }
    }

Using this mechanism, the default `main` demo can be overridden to use demo-specific SASS and/or JS instead of just including the module's `main.scss` or `main.js`:

    'origami-demo': {
      'demos': {
        'main': {
            'sass': 'demo.scss',
            'js': 'demo.js'
        },