var path = require('path');
var os = require("os");
var _ = require('underscore');
var fs = require('fs');

var fileparser = require('./lib/fileparser');

var configFile = path.resolve(__dirname, 'config.js');

var optimist = require('optimist')
    .usage('Usage: $0 [options]')
    .default('config', configFile);

var argv = optimist.argv;

if(argv.help || argv.h) {
    optimist.showHelp();
    return;
}

require("clim")(console, true);

var config = require(argv.config);

var sirvlog = require('sirvlog').createClient(config.sirvlog).on('error', function(err){
    //console.error(err);
});

// --------- APPLICATION ----------

Application = function(){

    this.parsers = [];

    this.counter = [];

    _.each(fs.readdirSync(config.configDir), function(f){
        if(/\.js$/.test(f)){
            var parserConfig = require(config.configDir + '/' + f);
            parserConfig.runtimeDir = config.runtimeDir;
            var parser = fileparser.createParser(parserConfig);

            this.counter[parserConfig.facility] = 0;

            parser
                .on('data', function(data){
                    _.defer(this.processLogs.bind(this), data, parserConfig);
                }.bind(this))
                .on('error', function(err){
                    //sirvlog.error(err.message, err.custom);
                    console.error(err);
                }.bind(this));

            this.parsers.push(parser);
        }
    }.bind(this));

    _.each(this.parsers, function(parser){
        setInterval(parser.parse.bind(parser), config.delay + 0.5*config.delay*Math.random());
    })

    console.log('Started');
}

Application.prototype.processLogs = function(logs, parserConfig){

    this.counter[parserConfig.facility] += logs.length;

    console.log('[' + parserConfig.facility + '] new messages: ' + logs.length, ' total: ', this.counter[parserConfig.facility]);

    //console.log(logs);

    _.each(logs, function(log){
        var timestamp = log._timestamp || Date.now();
        var message = log._message || '-';
        var level = log._level || 6;

        delete(log._timestamp);
        delete(log._message);
        delete(log._level);

        sirvlog._store({
            level: level,
            timestamp: timestamp,
            facility: parserConfig.facility,
            message: message,
            custom: log
        });

    }.bind(this))

}

// start Application
var app = new Application();

// register exit handlers so that process.on('exit') works
var exitFunc = function(){
    console.log('Shutting down');
    process.exit(0);
}

process.on('SIGINT', exitFunc);
process.on('SIGTERM', exitFunc);
