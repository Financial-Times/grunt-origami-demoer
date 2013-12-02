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
        mu = require('mu2');

  
    grunt.registerTask('origami-demo', 'Build static html pages to demo the origami module', function () {
    
        
        var bowerJson = require('../../../bower.json'),
            hasStyle = false,
            hasScript = false,
            templates = [],
            statics = [],
            options = this.options({
                modernizr: true
            }),
            viewModel = options.viewModel || {},
            done = this.async();

        var buildTemplates = function (callback) {
            
                viewModel.oDemoStyle = hasStyle ? '<link rel="stylesheet" href="main.css" />' : '';
                viewModel.oDemoScript = hasScript ? '<script src="main.js"></script>' : '';
                viewModel.oDemoModernizr = options.modernizr ? '<script src="modernizr.js"></script>' : '';
                viewModel.oDemoTitle = bowerJson.name.split('-').map(function (item) {
                    return item.charAt(0).toUpperCase() + item.substr(1);
                }).join (' ');
                
                async.each(templates, function (template, itemCallback) {
                    var name = template.split('.')[0];
                                      
                    fs.readFile('./' + template, {encoding: 'utf8'}, function (err, innerTemplate) {
                        fs.readFile('./node_modules/grunt-origami-demoer/templates/page.mustache', {encoding: 'utf8'}, function (err, tpl) {
                            grunt.file.write('./demos/' + name + '.html', tpl.replace('{{oDemoTpl}}', innerTemplate));
                            var result = '';
                            mu.clearCache();
                            mu.compileAndRender('demos/' + name + '.html', viewModel).on('data', function (data) {
                                result += data;
                            }).on('end', function () {
                                grunt.file.write('./demos/' + name + '.html', result);
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
                    grunt.file.write('tmp.scss', grunt.file.read('./node_modules/grunt-origami-demoer/scss/dev-overrides.scss', {encoding: 'utf8'}) + grunt.file.read('main.scss', {encoding: 'utf8'}));
                    // build the sass
                    grunt.util.spawn({
                        cmd: 'sass',
                        args: ['-I', 'bower_components', 'tmp.scss', 'demos/main.css']
                    }, function () {
                        grunt.file.delete('tmp.scss');
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

        
        grunt.file.delete('demos');
        
        bowerJson.main.forEach(function (item) {
            if (item === 'main.scss') {
                hasStyle = true;
            } else if (item === 'main.js') {
                hasScript = true;
            } else if (item.indexOf('.mustache') > -1 || item.indexOf('.html') > -1) {
                templates.push(item);
            } else {
                statics.push(item);
            }
        });

        async.parallel([buildTemplates, buildStyles, buildScripts], function (err, results) {
            if (options.modernizr) {
                grunt.file.copy((typeof options.modernizr === 'string' ? options.modernizr : 'bower_components/modernizr/modernizr.js'), 'demos/modernizr.js');
            }
            done();
        });
     
    });
};
