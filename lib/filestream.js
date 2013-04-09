var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var events = require("events");
var util = require("util");
var stream = require("stream");
var async = require('async');
var crypto = require('crypto');
var path = require('path');
var persistentObject = require('fs-persistent-object');

exports.FileStream = FileStream = function(filename, options){

    this.options = options;

    stream.Readable.call(this, options);

    var filenameHash = crypto.createHash('md5').update(filename).digest("hex")

    this.fileInfo = persistentObject.load(path.resolve(options.runtimeDir, filenameHash), {
        filename: filename,
        offset: 0,
        hash: null,
        hashPos: 512
    });

    if(/\.1$/.test(filename)){ // /var/log/proftpd/xferlog.1
        this.isRotatedFile = true;
    }

    this.reading = false;

    this.readBuffer = new Buffer(16384);

}

util.inherits(FileStream, stream.Readable);

exports.createStream = function (filename, options) {
    return new FileStream(filename, options);
};

FileStream.prototype.readFileChunk = function(size, cb){

    //console.log('offset=', this.fileInfo.offset);

    if(this.readBuffer.length < size){
        this.readBuffer = new Buffer(size);
    }

    fs.read(this.fd, this.readBuffer, 0, size, this.fileInfo.offset, function(err, bytesRead){
        if(err){
            cb(err, null);
            return;
        }

        while(bytesRead > 0 && this.readBuffer[bytesRead-1] !== 10){ // \n
            bytesRead--;
        }

        this.fileInfo.offset += bytesRead;

        cb(null, this.readBuffer.slice(0, bytesRead));

    }.bind(this))
}


FileStream.prototype.verifyFileInfo = function(cb){

    fs.read(this.fd, this.readBuffer, 0, 512, 0, function(err, bytesRead){
        if(err){
            cb(err);
            return;
        }

        if(bytesRead > 0){

            //console.log('bytesRead=', bytesRead, ', hashPos=', this.fileInfo.hashPos);

            var pos = this.fileInfo.hashPos;

            if(bytesRead < pos){
                pos = bytesRead;
            }

            var hash = crypto.createHash('md5').update(this.readBuffer.slice(0, pos)).digest("hex");

            if(this.fileInfo.hash != hash){ // content has changed, so that is a new file
                if(this.isRotatedFile){
                    cb(this.fileInfo.filename + ' is not a recently rotated file we expected, not parsing it!');
                    return;
                }
                if(this.fileInfo.hash && !this.isRotatedFile){
                    this.createRotatedStream();
                }
                this.fileInfo.offset = 0;
            }

            this.fileInfo.hash = crypto.createHash('md5').update(this.readBuffer.slice(0, bytesRead)).digest("hex");
            this.fileInfo.hashPos = bytesRead;
        }

        cb(null);

    }.bind(this))
}

FileStream.prototype.createRotatedStream = function(){
    var rf = this.fileInfo.filename + '.1';
    var hash = this.fileInfo.hash;
    var offset = this.fileInfo.offset;
    var hashPos = this.fileInfo.hashPos;

    fs.exists(rf, function(exists){
        if(exists){
            console.log('Checking rotated file ' + rf);

            this.rotatedStream = new FileStream(rf, this.options);
            this.rotatedStream.fileInfo.hash = hash;
            this.rotatedStream.fileInfo.hashPos = hashPos;
            this.rotatedStream.fileInfo.offset = offset;

            this.rotatedStream.on('end', function(){
                this.rotatedStream = null;
            }.bind(this))

            this.rotatedStream.on('data', function(data){
                console.log('Got some data from rotated file ' + rf);
                this.push(data);
            }.bind(this))
        }
    }.bind(this));
}

FileStream.prototype._read = function(size){

    if(this.reading) return;

    this.reading = true;

    async.series({

        // open file
        open: function(cb){
            fs.open(this.fileInfo.filename, 'r', 0666, function(err, fd){
                if(err){
                    cb(err);
                    return;
                }
                this.fd = fd;
                cb(null);
            }.bind(this));
        }.bind(this),

        // verify if file has been replaced
        verifyInfo: this.verifyFileInfo.bind(this),

        // read file chunk and send it to stream
        read: this.readFileChunk.bind(this, size)

    }, function(err, results){

        var buf = results.read || '';

        if(this.isRotatedFile && buf.length == 0){ // signal end of data because no one will append to rotated file
            buf = null;
        }

        if(err){
            if(err.code != 'ENOENT'){
                console.error(err);
            }
        }

        // close file descriptor
        if(this.fd){
            fs.close(this.fd, function(){}); // ignore errors
        }

        this.fd = null;

        this.reading = false;

        // push data to stream
        this.push(buf);

    }.bind(this))
}
