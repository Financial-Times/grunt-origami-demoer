'use strict';

module.exports = function(grunt) {

    var fs = require('fs'),
        async = require('async'),
        mu = require('mu2'),
        templateBuilder = require('../js/build-templates');

  
    grunt.registerTask('origami-demo', 'Build static html pages to demo the origami module', function () {
    
        
        var bowerJson = require('../../../bower.json'),
            hasStyle = false,
            hasScript = false,
            templates = [],
            assets = [],
            options = this.options({
                modernizr: true,
                scriptMode: null
            }),
            viewModel = options.viewModel || {},
            done = this.async();

        var buildTemplates = function (callback) {
            
                viewModel.oDemoStyle = hasStyle ? '<link rel="stylesheet" href="main.css" />' : '';
                viewModel.oDemoScript = hasScript ? '<script src="main.js"></script>' : '';
                viewModel.oDemoModernizr = options.modernizr ? '<script src="modernizr.js"></script>' : '';
                viewModel.oDemoTitle = 'Origami ' + bowerJson.name.split('-').join (' ').substr(2) + ' - ' + bowerJson.name;
                viewModel.oHoverClass = bowerJson.dependencies['o-hoverable'] ? ' o-hoverable-on' : '';
                
                async.each(templates, function (templateFile, itemCallback) {
                    var name = templateFile.split('.')[0];
                                      
                    fs.readFile('./' + templateFile, {encoding: 'utf8'}, function (err, templateContent) {
                        fs.readFile('./node_modules/grunt-origami-demoer/templates/page.mustache', {encoding: 'utf8'}, function (err, tpl) {
                            grunt.file.write('./demos/' + name + '.html', tpl.replace('{{oDemoTpl}}', '{{ > ./origami-templates/' + bowerJson.name + '/' + templateFile + '}}'));
                            
                            templateBuilder(grunt, {
                                // pathToCompiled: './origami',
                                parentModule: bowerJson.name,
                                files: ['./demos/' + name + '.html']
                            });

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
                    var hyphenName = bowerJson.name,
                        capsName = hyphenName.replace(/(?:^|\-)(\w)/g, function ($0, $1, $2) {
                            return $1.toUpperCase();
                        }),
                        sassOverrides = '',
                        mainStyles;

                    if (grunt.config.get('origami-demo.options.sassExtras')) {
                        sassOverrides = grunt.file.read(grunt.config.get('origami-demo.options.sassExtras'));
                    }
                        
                    sassOverrides +=  grunt.file.read('./node_modules/grunt-origami-demoer/scss/var-overrides.scss', {encoding: 'utf8'})
                                        .replace(/\{\{ModuleName\}\}/g, capsName).replace(/\{\{module\-name\}\}/g, hyphenName);

                    mainStyles = grunt.file.exists('demo.scss') ? grunt.file.read('demo.scss') : grunt.file.read('main.scss');
                    grunt.file.write('tmp.scss', sassOverrides + mainStyles);
                    
                    // build the sass
                    grunt.util.spawn({
                        cmd: 'sass',
                        // sass -I bower_components tmp.scss demos/main.css 
                        args: ['-I', 'bower_components', 'tmp.scss', 'demos/main.css']
                    }, function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            grunt.file.delete('tmp.scss');
                        }
                        callback(null, null);
                    });
                } else {
                    callback(null, null);
                }
            },

            buildAssets = function (callback) {
                assets.forEach(function (file) {
                    grunt.file.copy(file, 'bower_components/' + bowerJson.name + '/' + file);
                });
                callback(null, null);
            },
          
            buildScripts = function (callback) {
                if (hasScript) {
                    if (options.scriptMode === 'browserify') {
                        grunt.util.spawn({
                            // browserify main.js -o demos/main.js
                            cmd: 'browserify',
                            args: ['main.js', '-t', 'debowerify', '-o', 'demos/main.js', '--debug']
                        }, function (err) {
                            if (err) {
                                console.log(err);
                            }
                            callback(null, null);
                        });
                        
                    } else {
                        grunt.file.copy('main.js', 'demos/main.js');
                        callback(null, null);
                    }
                } else {
                    callback(null, null);
                }
            };

        function processItem(item) {
            if (item === 'main.scss') {
                hasStyle = true;
            } else if (item === 'main.js') {
                hasScript = true;
            } else if (['mu', 'ms', 'mustache', 'html'].indexOf(item.split('.').pop()) > -1) {
                templates.push(item);
            } else {
                assets.push(item);
            }
        }

        if (!fs.existsSync('demos')) {
            grunt.file.mkdir('demos');
        }

        grunt.file.recurse('demos', function (file) {
            grunt.file.delete(file);
        });

        // Files specified in grunt config: 
        var gruntMain = grunt.config.get('origami-demo.options.main');
        if (gruntMain && gruntMain.forEach) {
            gruntMain.forEach(processItem);
        }
        
        // Files specified in bower.json main property
        if (bowerJson.main && bowerJson.main.forEach) {
            bowerJson.main.forEach(processItem);
        }

        async.parallel([buildTemplates, buildStyles, buildScripts, buildAssets], function (err, results) {
            if (options.modernizr) {
                grunt.file.copy((typeof options.modernizr === 'string' ? options.modernizr : 'bower_components/modernizr/modernizr.js'), 'demos/modernizr.js');
            }
            done();
        });
     
    });
};
