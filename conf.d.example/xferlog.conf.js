var _ = require('underscore');
var querystring = require('querystring');

module.exports = {
    facility: 'xferlog',

    file: '/home/oleksiy/xferlog',

    csv: false,

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

            var a = this._message.split(' ');

            if(a.length != 18) return null; // man xferlog

            var date = a.splice(0, 5).join(' ');

            this._timestamp = Date.parse(date) || Date.now();

            this.transfer_time = parseFloat(a[0]);
            this.remote_addr = a[1];
            this.file_size = parseInt(a[2]);
            this.filename = a[3];
            this.transfer_type = a[4];
            this.special_action_flag = a[5];
            this.direction = a[6];
            this.access_mode = a[7];
            this.username = a[8];
            this.service_name = a[9];
            this.authentication_method = a[10];
            this.authenticated_user_id = a[11];
            this.completion_status = a[12];

            switch(this.transfer_type){
                case 'a':
                    this.transfer_type = 'ascii';
                    break;
                case 'b':
                    this.transfer_type = 'binary';
                    break;
            }

            switch(this.special_action_flag){
                case 'C':
                    this.special_action_flag = 'file was compressed';
                    break;
                case 'U':
                    this.special_action_flag = 'file was uncompressed';
                    break;
                case 'T':
                    this.special_action_flag = 'file was tar\'ed';
                    break;
                case '_':
                    this.special_action_flag = 'no action was taken';
                    break;
            }

            switch(this.direction){
                case 'o':
                    this.direction = 'outgoing';
                    break;
                case 'i':
                    this.direction = 'incoming';
                    break;
                case 'd':
                    this.direction = 'deleted';
                    break;
            }

            switch(this.access_mode){
                case 'a':
                    this.access_mode = 'anonymous';
                    break;
                case 'r':
                    this.access_mode = 'authenticated';
            }

            switch(this.completion_status){
                case 'c':
                    this.completion_status = 'complete';
                    break;
                case 'i':
                    this.completion_status = 'incomplete';
            }

            this._message = this.direction + ': ' + this.filename;

        }

    ]
}