var path = require('path');
var fs = require('fs');
var csv = require('csv');
var _ = require('underscore');
var async = require('async');
var events = require("events");
var util = require("util");

var filestream = require('./filestream');

exports.FileParser = FileParser = function (config) {
    this.config = config;

    if(!fs.existsSync(this.config.file)){
        console.log('WARNING: file does not exist: ' + this.config.file);
    }

    this.stream = filestream.createStream(this.config.file, {
        encoding: 'utf8',
        runtimeDir: config.runtimeDir
    });

    this.stream.on('data', function(data){

        //console.log(data);

        if(this.config.csv){
            this.csv(data);
        } else {
            this.plain(data);
        }


    }.bind(this))
}

util.inherits(FileParser, events.EventEmitter);

exports.createParser = function (config) {
    return new FileParser(config);
};

FileParser.prototype.parse = function(){
    this.stream.read(0);
}

FileParser.prototype.plain = function(data){
    data = data.split('\n');

    var logs = _.map(data, function(str){
        return this.filters({
            _message: str
        })

    }.bind(this))

    logs = _.reject(logs, function(log){
        return log === null || log === undefined;
    })

    this.emit('data', logs);
}

FileParser.prototype.filters = function(row){
    try {
        // run through filters
        for (var i = 0; i < this.config.filters.length; i++) {
            var stop = this.config.filters[i].apply(row);

            if (stop === null) { // message dropped by filter
                //console.log('message dropped by filter');
                return;
            } else if (stop === false) { // stop filter processing
                //console.log('stop processing by filters');
                break;
            }
        }

        return row;
    } catch(e){
        console.error(e);
    }
}

FileParser.prototype.csv = function(data){
    csv()
        .from.options(this.config.csv)
        .from(data)
        .to.array(function(logs){
            this.emit('data', logs);
        }.bind(this))
        .transform(function(row, index){
            return this.filters(row);
        }.bind(this))
        .on('error', function(error){
            console.error(error);
            //this.emit('error', 'CSV error: ' + error);
        }.bind(this));
}

