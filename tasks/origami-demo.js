'use strict';

module.exports = function(grunt) {

    var fs = require('fs'),
        async = require('async'),
        mu = require('mu2'),
        extend = require('node.extend'),
        defaultOptions = {
            _moduleRoot: "./node_modules/grunt-origami-demoer/",
            sass: "main.scss",
            js: "main.js",
            scriptMode: "normal",
            silentSass: false,
            modernizr: true,
            pageTemplate: "./node_modules/grunt-origami-demoer/src/templates/page.mustache",
            template: "main.mustache",
            demoSrcRoot: "demo-src/",
            viewModel: {}
        },
        taskOptions,
        defaultDemos = {
            'main': {}
        },
        taskDemos,
        bowerJson,
        options,
        demos;

    function getDemoOptions(name) {
        var opts = extend(true, options, taskDemos[name]);
        opts.name = name;
        return opts;
    }

    function createSassVariablesFile(variables, file) {
        var contents = "";
        for (var prop in variables) {
            if (variables.hasOwnProperty(prop)) {
                var value = variables[prop];
                contents += "$" + prop + ":" + value + ";\n";
            }
        }
        grunt.file.write(file, contents);
    }

    function createSass(srcPath, demoOptions, callback) {
        var dest = 'demos/' + demoOptions.sass.replace('.scss', '.css');
        if (!fs.existsSync(srcPath + demoOptions.sass) || fs.existsSync(dest)) {
            callback();
            return;
        }
        var sassVars = {
            "o-grid-mq-type": 'width',
            "o-assets-global-path": '"../bower_components/"'
        };
        sassVars[bowerJson.name + "-is-silent"] = demoOptions.silentSass;
        createSassVariablesFile(sassVars, "sass-vars.scss");

        var sassReset = grunt.file.read(options._moduleRoot + '/src/scss/reset.scss', {encoding: 'utf8'}),
            sassVariables = grunt.file.read('sass-vars.scss', {encoding: 'utf8'}),
            demoStyles = grunt.file.read(srcPath + demoOptions.sass);

        grunt.file.write('tmp.scss', sassReset + sassVariables + demoStyles);
        grunt.file.delete("sass-vars.scss");

        grunt.util.spawn({
            cmd: 'sass',
            // sass -I bower_components tmp.scss demos/main.css
            args: ['-I', 'bower_components', 'tmp.scss', dest]
        }, function (err) {
            if (err) {
                grunt.log.error(err);
            } else {
                grunt.log.writeln(dest + " created.");
                grunt.file.delete('./tmp.scss');
            }
            callback();
        });

    }

    function createJs(srcPath, demoOptions, callback) {
        var dest = 'demos/' + demoOptions.js;
        if (!fs.existsSync(srcPath + demoOptions.js) || fs.existsSync(dest)) {
            callback();
            return;
        }
        if (demoOptions.scriptMode === 'browserify') {
            srcPath = "./" + srcPath;
            grunt.util.spawn({
                cmd: 'browserify',
                // -r flag used in order to make main.js available via the origami module name
                // -e flag used in order to get main.js to run immediately
                args: ['-r', srcPath + demoOptions.js + ':' + bowerJson.name, '-e', srcPath + demoOptions.js, '-t', 'debowerify', '-t', 'brfs', '-o', dest, '--debug']
            }, function (err, result, code) {
                if (err) {
                    grunt.log.error(err, result, code);
                } else {
                    grunt.log.writeln(dest + " created.");
                }
                callback(null, null);
            });
        } else {
            grunt.file.copy(srcPath + demoOptions.js, dest);
            grunt.log.writeln(dest + " copied.");
            callback(null, null);
        }
    }

    function createHtml(srcPath, demoOptions, callback) {
        var viewModel = demoOptions.viewModel,
            dest = 'demos/' + demoOptions.name + ".html";
        if (!fs.existsSync(srcPath + demoOptions.template) || fs.existsSync(dest)) {
            callback();
            return;
        }
        if (demoOptions.sass) {
            viewModel.oDemoStyle = '<link rel="stylesheet" href="' + demoOptions.sass.replace('.scss', '.css') + '" />';
        }
        if (demoOptions.js) {
            viewModel.oDemoScript = '<script src="' + demoOptions.js + '"></script>';
        }
        viewModel.oDemoModernizr = options.modernizr ? '<script src="modernizr-custom.js"></script>' : '';
        viewModel.oDemoTitle = 'Origami ' + bowerJson.name.split('-').join (' ').substr(2) + ' - ' + bowerJson.name;
        viewModel.oHoverClass = bowerJson.dependencies['o-hoverable'] ? ' o-hoverable-on' : '';

        var demoTemplateContent = "",
            pageTemplateContent = "";
        mu.clearCache();
        mu.compileAndRender(srcPath + demoOptions.template, viewModel).on('data', function (data) {
            demoTemplateContent += data;
        }).on('end', function () {
                viewModel.oDemoTpl = demoTemplateContent;
                mu.clearCache();
                mu.compileAndRender(demoOptions.pageTemplate, viewModel).on('data', function (data) {
                    pageTemplateContent += data;
                }).on('end', function () {
                        grunt.file.write(dest, pageTemplateContent);
                        grunt.log.writeln(dest + ' created.');
                        callback();
                    });
            });
    }

    function clearExistingDemos() {
        if (!fs.existsSync('demos')) {
            grunt.file.mkdir('demos');
        }
        grunt.file.recurse('demos', function (file) {
            grunt.file.delete(file);
        });
    }

    grunt.registerTask("origami-demo", function() {
        clearExistingDemos();
        taskOptions = grunt.config.get('origami-demo.options');
        taskDemos = grunt.config.get('origami-demo.demos') || {};
        options = extend(true, defaultOptions, taskOptions);
        demos = extend(true, defaultDemos, taskDemos);
        bowerJson = require('../../../bower.json');
        var buildModernizr = false,
            taskDone = this.async();

        async.eachSeries(Object.keys(demos), function(name, outerCallback) {
            var demoOptions = getDemoOptions(name),
                demoSrcPath = (name === "main" && demoOptions.template === "main.mustache") ? "" : options.demoSrcRoot;
            if (demoOptions.modernizr) {
                buildModernizr = true;
            }
            async.parallel([
                function(innerCallback) {
                    createSass(demoSrcPath, demoOptions, innerCallback);
                },
                function(innerCallback) {
                    createJs(demoSrcPath, demoOptions, innerCallback);
                },
                function(innerCallback) {
                    createHtml(demoSrcPath, demoOptions, innerCallback);
                }
            ], function (err) {
                if (err) {
                    grunt.log.error(err);
                } else {
                    grunt.log.ok("Demo '" + name + "' done.");
                }
                outerCallback();
            });

        }, function(err) {
            if (err) {
                grunt.log.error(err);
            } else {
                grunt.log.ok("All demos done.");
            }
            if (buildModernizr) {
                grunt.task.run(["origami-demo-modernizr"]);
            } else {
                grunt.log.ok("Modernizr build skipped.");
            }
            taskDone();
        })
    });

};
