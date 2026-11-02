module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const publishableKey = process.env.CLERK_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
  
  if (res.status && typeof res.status === 'function') {
    return res.status(200).json({ publishableKey });
  }

  res.statusCode = 200;
  return res.end(JSON.stringify({ publishableKey }));
};
