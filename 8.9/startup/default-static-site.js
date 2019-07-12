var express = require('express');
var server = express();
var options = {
    index: ['index.html','hostingstart.html']
};
server.use('/', express.static('/opt/startup', options));
server.listen(process.env.PORT);
