/*
 * grunt-contrib-uglify
 * http://gruntjs.com/
 *
 * Copyright (c) 2013 "Cowboy" Ben Alman, contributors
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {


  var fs = require('fs'),
      async = require('async'),
      mu = require('mu2'),
      modernizr = require('../node_modules/grunt-modernizr/tasks/modernizr.js');

  modernizr(grunt);

  grunt.registerTask('origami-demo', 'Build an auto-updating static html page to demo the origami module', function () {
    
    var main = require('../../../bower.json').main,
        hasStyle = false,
        hasScript = false,
        templates = [],
        options = this.options({
          modernizr: true
        }),
        done = this.async();




    var buildTemplates = function (callback) {

        viewModel.oStylesheet = hasStyle ? '<link rel="stylesheet" href="main.css" />' : '';
        viewModel.oScript = hasScript ? '<script src="main.js"></script>' : '';
        viewModel.oModernizr = options.modernizr ? '<script src="modernizr-custom.js"></script>' : '';

        async.each(templates, function (template, itemCallback) {
          var name = template.split('.')[0];
          
          fs.readFile('./' + template, {encoding: 'utf8'}, function (err, innerTemplate) {
            fs.readFile('./node_modules/grunt-origami-demoer/templates/page.mustache', {encoding: 'utf8'}, function (err, tpl) {
              grunt.file.write('./demos/' + name + '.html', tpl.replace('{{tpl}}', innerTemplate));
              var result = '';
              mu.clearCache();
              console.log('demos/' + name + '.html');
              mu.compileAndRender('demos/' + name + '.html', viewModel)
                .on('data', function (data) {
                  result += data;
                }).on('end', function() {
                  fs.writeFile('./demos/' + name + '.html', result, function () {});
                  itemCallback(null, tpl);
                });
            });
          });
        }, function () {
          callback(null, null);
        });
 
      },
      buildStyles = function (callback) {
        if (hasStyle) {
          // build the sass
          grunt.util.spawn({
            cmd: 'sass',
            args: ['-I', 'bower_components', 'main.scss', 'demos/main.css']
          }, function () {
            callback(null, null);
          });
        } else {
          callback(null, null);
        }
        
      },
      buildScripts = function (callback) {
        if (hasScript) {
           
        // build the script - need to set options probably and then use require or something
      
        } else {
          callback(null, null);
        }
      };

    main.forEach(function (item) {
      if (item === 'main.scss') {
        hasStyle = true;
      } else if (item === 'main.js') {
        hasScript = true;
      } else if (item.indexOf('.mustache') > -1) {
        templates.push(item);
      }
    });

    var viewModel = options.viewModel || {};

  
    async.parallel([buildTemplates, buildStyles, buildScripts], function (err, results) {
        if (options.modernizr) {
          
          

          grunt.config.set('modernizr', {
              'devFile': 'modernizr/modernizr.js', // [REQUIRED] Path to the build you're using for development.
              'outputFile': './demos/modernizr-custom.js', // [REQUIRED] Path to save out the built file.
              'extra': {
                  'shiv': true,
                  'printshiv': false,
                  'load': false,
                  'mq': false,
                  'cssclasses': true
              },
              'extensibility': {
                  'addtest': false,
                  'prefixed': false,
                  'teststyles': false,
                  'testprops': false,
                  'testallprops': false,
                  'hasevents': false,
                  'prefixes': false,
                  'domprefixes': false
              },
              'uglify': false,
              'tests': [],
              'parseFiles': true,
              'files': [
                  './demos/main.css',
                  './demos/main.js'
              ],
              'matchCommunityTests': false, // When parseFiles = true, matchCommunityTests = true will attempt to match user-contributed tests.
              'customTests': [] // Have custom Modernizr tests? Add paths to their location here.
          });

          grunt.task.run(['modernizr']);
        } else {
          // done();
        }
    });
    
 });

  grunt.registerMultiTask('origami-demo-watch', function () {

  });

};
