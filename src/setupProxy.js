// serves as proxy in the development mode

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://0.0.0.0:8000', // Replace with your backend server URL
      changeOrigin: true,
      pathRewrite: {
        '^/api': '',
      },
    })
  );
};
