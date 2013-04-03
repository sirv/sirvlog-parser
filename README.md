# sirvlog-parser

Parse Nginx, Apache, Proftpd or any other logs and send them to [sirvlog](https://github.com/sirv/sirvlog) server

Sample configurations are available in [conf.d.example](https://github.com/sirv/sirvlog-parser/tree/master/conf.d.example)

### Features

  * Will remember file position for each logfile when stopped/started
  * Handles log files rotated by logrotate (so it wont miss a single record)
  * Easy to configure new services as it can handle CSV files (quoted fields separated by whitespace for example) or just any log file. See [nginx access.log](https://github.com/sirv/sirvlog-parser/blob/master/conf.d.example/nginx.conf.js) as an example of CSV input (needs configured nginx log_format) and [proftpd xferlog](https://github.com/sirv/sirvlog-parser/blob/master/conf.d.example/xferlog.conf.js) as an example of free form log file
  * Filters (in Javascript) to parse (or modify) each log message
  
Example of parsed message (as in [sirvlog web frontend](https://github.com/sirv/sirvlog-web) ):

[<img src="https://dl.dropbox.com/u/102761139/sirvlog-web/sirvlog-parser.jpg" width="600px"/>](https://dl.dropbox.com/u/102761139/sirvlog-web/sirvlog-parser.jpg)


### See also

  * [sirvlog](https://github.com/sirv/sirvlog)
  * [sirvlog web frontend](https://github.com/sirv/sirvlog-web)
  * [service healh monitors for sirvlog](https://github.com/sirv/sirvlog-monitors)

## Authors

**Oleksiy Krivoshey**

  * [https://github.com/oleksiyk](https://github.com/oleksiyk)

# License (MIT)

Copyright (c) 2013 Sirv.

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

