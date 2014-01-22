#grunt origami demoer

A grunt task to generate demo pages for your origami module.

It will look in your `bower.json`'s `main` property, or optionally a Grunt config property, and create an HTML demo page for each template file it finds, including any styles and scripts it finds too.

##Usage

1. `npm install grunt`
2. `npm install grunt-origami-demoer`  
3. [optional] `npm install grunt-contrib-watch`
    For ease of reuse steps 1 - 3 should be encapsulated in the `devDependencies` property of your module's `package.json` file

4. In your module's root directory add a `Gruntfile.js` with something like the following content

    	module.exports = function(grunt) {

		  // Project configuration.
		  grunt.initConfig({
		    'origami-demo': {
		      options: {
		        modernizr: true, // if you are using modernizr but not including it using bower's default settings this will need to be set to the path to your local copy of modernizr
		        viewModel: {}// a javascript object of example content to be consumed by your module's template
		        scriptMode: null // set to 'browserify' if your scripts need to be built
		        main: ['example.mustache'] //optional list of files to process in addition to those listed in bower.json.main
		        sassExtras: 'demos.scss' // additional sass that gets included before your modules main.scss file
		      }
		    },
		    'watch': {
		        'origami-demo': {
	                files: ['main.scss', 'main.js', 'bower-components/**/*'], //edit as necessary
	                tasks: ['origami-demo']
	            }
		    }
		  });

		  grunt.loadNpmTasks('grunt-origami-demoer');
		  grunt.loadNpmTasks('grunt-contrib-watch');

		  grunt.registerTask('default', ['origami-demo']);

		};
        
5. `grunt origami-demo`
6. `grunt watch:origamiDemo`
        

## TODO
* Inclusion of static assets using scripts
* Partials in mustache templates
