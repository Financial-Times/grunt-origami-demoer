var path = require('path');


module.exports = function (grunt, config) {
    function addFileExtension (path) {
        return (/\.(html|mustache|svg)$/).test(path) ? path : (path + '.mustache');
    }

    function parseSettings(settings) {
        var obj = {};
        if (settings) {
            settings = settings.split(',').forEach(function (setting) {
                setting = setting.split('=');
                obj[setting[0]] = setting[1];
            });
        }
        return obj;
    }


    function analyzeMustacheContent (content, module) {
        
        var parsedMustache,
            origamiTemplatesDirectory = config.pathToCompiled || './origami-templates',
            origamiPartialRX = new RegExp('> *(?:(?:\\.?\\/)?' + origamiTemplatesDirectory.replace('/', '\\/') + '\\/)?(o\\-[a-z\\d\\-]+)((?:\\/[\\w\\d\\-_]+)*\\/[\\w\\d\\-]+)(\\.mustache|\\.html|\\.svg)?', 'gi'),
            // matches stings of the form o-modulename/path/to/template!items=path/to/partial,moreitems=path/to/other/partial
            normalPartialRX = /> *((?:\.?\/)?[a-z\d\-\/_]+)(\.mustache|\.html|\.svg)?/gi,
            normalTemplatePrefix = grunt.config('build-templates.cwd') || '';

        if (parsedMustache = origamiPartialRX.exec(content)) {
            return {
                type: 'origamiPartial',
                module: parsedMustache[1],
                template: parsedMustache[2],
                fileExtension: parsedMustache[3] || '.mustache'
            };
        } else if (parsedMustache = normalPartialRX.exec(content)) {
            if (module) {
                return {
                    type: 'origamiPartial',
                    module: module,
                    template: parsedMustache[1],
                    fileExtension: parsedMustache[2] || '.mustache'
                };
            } else {
                return {
                    type: 'normalPartial',
                    template: normalTemplatePrefix + parsedMustache[1],
                    fileExtension: parsedMustache[2] || '.mustache'
                };
            }

        }
        return {};
    }

    function inlineOrigamiPartials (template, module, settings) {
        settings = settings || {};

        var origamiTemplatesDirectory = config.pathToCompiled || './origami-templates',
            bowerDirectory = config.pathToBower || 'bower_components',
            cwd = (config.cwd || ''),
            newTemplate = grunt.file.read(template).replace(/\{\{(?!\!) *([^(?:\}\})]*) *\}\}/g, function ($0, content) {
                var action = analyzeMustacheContent(content, module),
                    result = $0;

                if (action.type === 'origamiPartial') {
                    
                    result = inlineOrigamiPartials(path.join(process.cwd(), (action.module !== config.parentModule ? 'bower_components/' + action.module : '') + action.template + action.fileExtension), action.module, {});
                    
                } else {
                    if (action.type === 'normalPartial') {
                        // it's not an origami partial so we just treat it as a relative path
                        inlineOrigamiPartials(path.join(process.cwd(), action.template + action.fileExtension ));
                    }
                    
                }
                return result;

            });

        if (module) {
            
            grunt.file.write(cwd + origamiTemplatesDirectory + '/' + module + template.split(module).pop(), newTemplate);
        }
        return newTemplate;

    }

    var templates = grunt.file.expand(config.files);

    templates.forEach(function (tpl) {
        inlineOrigamiPartials(tpl);
    });

};