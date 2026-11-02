const url = require('url');

const routes = {
  'admin': require('./admin'),
  'apikeys': require('./apikeys'),
  'checkout': require('./checkout'),
  'clerk-config': require('./clerk-config'),
  'clerk-sync': require('./clerk-sync'),
  'credits': require('./credits'),
  'forgot-password': require('./forgot-password'),
  'google-auth': require('./google-auth'),
  'login': require('./login'),
  'me': require('./me'),
  'reset-password': require('./reset-password'),
  'signup': require('./signup'),
  'verify-otp': require('./verify-otp'),
  'webhook': require('./webhook')
};

module.exports = async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname || '';
  
  // Extract route name (e.g. /api/login -> login)
  let routeName = req.query.route || pathname.replace(/^\/api\/?/, '').split('/')[0].split('?')[0];

  const handler = routes[routeName];

  if (handler) {
    try {
      return await handler(req, res);
    } catch (err) {
      console.error(`Error in API route '${routeName}':`, err);
      if (res.status && typeof res.status === 'function') {
        res.status(500);
      } else {
        res.statusCode = 500;
      }
      return res.end(JSON.stringify({ error: 'Internal Server Error', message: err.message }));
    }
  } else {
    if (res.status && typeof res.status === 'function') {
      res.status(404);
    } else {
      res.statusCode = 404;
    }
    return res.end(JSON.stringify({ error: `API route '${routeName}' not found` }));
  }
};
