var express = require('express');
var server = express();
var options = {
    index: 'hostingstart.html'
};
server.use('/', express.static('/opt/startup', options));
server.listen(process.env.PORT);
