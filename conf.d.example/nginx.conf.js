var _ = require('underscore');
var querystring = require('querystring');

module.exports = {
    facility: 'nginx',

    //file: '/var/log/nginx/access.log',
    file: '/home/oleksiy/nginx.access.log.big',

    csv: {
        delimiter: " ",

        /**
         * NGINX log format:
         *
         * log_format combined-sirv '"$http_x_forwarded_for" "$remote_user" $msec "$time_local" "$request" $status $body_bytes_sent "$http_referer" "$http_user_agent"';
         */

        columns: ["remote_addr", "remote_user", "msec", "time_local", "request", "status", "body_bytes_sent", "http_referer", "http_user_agent"]
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
            if(this['msec'] == null) return null; // parsing failed

            this._timestamp = 1000 * parseFloat(this['msec']) || Date.now();

            delete(this['msec']);

            this._message = this['request'];

            // these are numbers
            _.each(['body_bytes_sent', 'status'], function(field){
                this[field] = parseInt(this[field]);
            }.bind(this))

            if(this['status'] >= 400){
                this._level = 4; // warning
            }

            if(this['status'] >= 500){
                this._level = 3; // error
            }

            // decode some URI encoded fields
            _.each(['http_user_agent', 'http_referer', 'request'], function(field){
                this[field] = decodeURIComponent(this[field]);
            }.bind(this))

            /*
            // parse request body
            try {
                var parsed = querystring.parse(this['request_body']);
                if(parsed){
                    parsed.indexOf = function(){return -1}; // fix csv trying to call this function
                    this['request_body'] = parsed;
                }
            } catch (e){ }
            */
        }

    ]
}