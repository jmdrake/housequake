var http = require('http'); // Import Node.js core module
var fs = require('fs');

var server = http.createServer(function (req, res) {   //create web server
    if (req.url == '/') { //check the URL of the current request
			fs.readFile('index.html', function(err, data) {
				res.writeHead(200, {'Content-Type': 'text/html'});
				res.write(data);
				return res.end();
			});           
    }
    else if (req.url == "/student") {
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write('<html><body><p>This is student Page.</p></body></html>');
        res.end();
    
    }
    else if (req.url == "/admin") {
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write('<html><body><p>This is admin Page.</p></body></html>');
        res.end();
    
    }
    else
        res.end('Invalid Request!');

}).listen(8080);