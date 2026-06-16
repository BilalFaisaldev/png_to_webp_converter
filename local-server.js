const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 5000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // Route API requests
  if (pathname.startsWith('/api/')) {
    const apiName = pathname.substring(5); // e.g. "login" or "admin"
    const apiPath = path.join(__dirname, 'api', `${apiName}.js`);
    
    if (fs.existsSync(apiPath)) {
      // Clear cache for easy reloading during dev
      delete require.cache[require.resolve(apiPath)];
      const handler = require(apiPath);
      
      // Enhance req and res
      req.query = parsedUrl.query;
      req.params = {};
      
      // Parse body if any
      let bodyData = '';
      req.on('data', chunk => {
        bodyData += chunk;
      });
      
      req.on('end', async () => {
        if (bodyData) {
          try {
            req.body = JSON.parse(bodyData);
          } catch (e) {
            req.body = bodyData;
          }
        } else {
          req.body = {};
        }
        
        // Mock res.status().json()
        res.status = (statusCode) => {
          res.statusCode = statusCode;
          return res;
        };
        
        res.json = (data) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
          return res;
        };
        
        try {
          await handler(req, res);
        } catch (err) {
          console.error(`Error executing API ${apiName}:`, err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Internal server error' }));
        }
      });
      return;
    } else {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'API route not found' }));
      return;
    }
  }

  // Serve static files
  if (pathname === '/') {
    pathname = '/index.html';
  }
  
  const filePath = path.join(__dirname, pathname);
  
  // Prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }
  
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.statusCode = 404;
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
