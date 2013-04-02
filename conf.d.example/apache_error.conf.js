
module.exports = {
    facility: 'apache',

    file: '/home/oleksiy/error.log',

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

            var a = this._message.match(/^\[(.+)\] \[(.+)\] \[client (.+)\] (.+)$/);

            if(!a) return false;

            this._timestamp = Date.parse(a[1]) || Date.now();

            switch(a[2]){
                case 'emerg':
                    this._level = 0;
                    break;
                case 'alert':
                    this._level = 1;
                    break;
                case 'crit':
                    this._level = 2;
                    break;
                case 'error':
                    this._level = 3;
                    break;
                case 'warn':
                    this._level = 4;
                    break;
                case 'notice':
                    this._level = 5;
                    break;
                case 'info':
                    this._level = 6;
                    break;
                case 'debug':
                    this._level = 7;
                    break;
                default:
                    this._level = 4;
            }

            this.client = a[3];

            this._message = a[4];

        }

    ]
}