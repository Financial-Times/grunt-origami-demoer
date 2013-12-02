#grunt origami demoer

A grunt task to generate demo pages for your origami module i.e. for each template listed in your `bower.json`'s `main` property, a html page including the template and all the module's styles and scripts will be created

##Usage

1. `npm install grunt`
2. `npm install grunt-origami-demoer`  
    For ease of reuse steps 1 and 2 should be encapsulated in the `devDependencies` property of your module's `package.json` file

3. In your module's root directory add a `Gruntfile.js` with something like the following content

		module.exports = function(grunt) {

		  // Project configuration.
		  grunt.initConfig({
		    'origami-demo': {
		      options: {
		        modernizr: true, // if you are using modernizr but not including it using bower's default settings thi swill need to be set to the path to your local copy of modernizr
		        viewModel: {}// a javascript object of example content to be consumed by your module's template
		      }
		    }
		  });

		  grunt.loadNpmTasks('grunt-origami-demoer');

		  grunt.registerTask('default', ['origami-demo']);

		};

4.`grunt origami-demo`

## Still to be developed
* Building of scripts
* Inclusion of static assets using stylesheets or scripts
* Partials in mustache templates
