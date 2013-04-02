var _ = require('underscore');

module.exports = {
    facility: 'proftpd',

    file: '/home/oleksiy/test-ftp.log',

    csv: {
        delimiter: " ",

        quote: "'",

        escape: "'",

        /**
         * PROFTPD log format:
         *
         * LogFormat sirv "'%a' '%b' '%D' '%F' '%{file-modified}' '%r' '%s' '%S' '%{%a, %d %b %Y %T %z}t' '%T' '%U'"
         * ExtendedLog /var/log/proftpd/sirv.log ALL sirv
         */

        columns: ["remote_addr", "bytes_sent", "directory", "filename", "file_modified", "command", "response_code", "response_message", "time_local_2822", "time_taken", "username"]
    },

    /**
     *  each function defined in this array will be called for each log message received.
     *  'this' will be a message object
     *
     *  return null to drop the message
     *
     *  return false to stop further filtering
     *
     *  function should by synchronous at this moment
     */
    filters: [

        function(){

            if(this['time_local_2822'] == null) return null; // parsing failed

            this._timestamp = new Date(this['time_local_2822']).getTime() || Date.now();

            delete(this['time_local_2822']);

            this._message = this['command'] + ': ' + this['response_message'];

            // these are numbers
            _.each(['bytes_sent', 'response_code'], function(field){
                this[field] = parseInt(this[field]) || 0;
            }.bind(this))

            // these are floats
            _.each(['time_taken'], function(field){
                this[field] = parseFloat(this[field]) || 0.0;
            }.bind(this))

            this['file_modified'] = (this['file_modified'] == "true"); // boolean value

            // change "-" to null
            _.each(['directory', 'filename'], function(field){
                if(this[field] == '-'){
                    this[field] = null;
                }
            }.bind(this))

            if(this['response_code'] >= 500){
                this._level = 4; // warning
            }
        }

    ]
}