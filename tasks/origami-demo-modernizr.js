'use strict';

module.exports = function(grunt) {

    grunt.task.registerTask("origami-demo-modernizr", "", function() {

        grunt.loadTasks("./node_modules/grunt-origami-demoer/node_modules/grunt-modernizr/tasks");

        grunt.config.set('modernizr.origami-demo', {
            "devFile" : "./node_modules/grunt-origami-demoer/src/lib/modernizr-latest.js",
            "outputFile" : "demos/modernizr-custom.js",
            "uglify" : false,
            "extra" : {
                "shiv" : false,
                "printshiv" : false,
                "load" : false,
                "mq" : false,
                "cssclasses" : true
            },
            "files": {
                "src": ["demos/*.css", "demos/*.js"]
            }
        });

        grunt.task.run('modernizr');

    });

};