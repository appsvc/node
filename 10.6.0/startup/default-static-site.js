var express = require('express');
var server = express();
var options = {
    index: 'hostingstart.html'
};
server.use('/', express.static('/home/site/wwwroot', options));
server.listen(process.env.PORT);
