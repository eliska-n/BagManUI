// serves as proxy in the development mode

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://10.17.165.188:8000', // Replace with your backend server URL
      changeOrigin: true,
      pathRewrite: {
        '^/api': '',
      },
    })
  );
};
