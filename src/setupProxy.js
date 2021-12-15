const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    createProxyMiddleware('/authorization',{
      target: 'https://auth.riotgames.com/api/v1', // server 주소를 넣어주면 된다.
      changeOrigin: true,
    })
  );

  app.use(
    createProxyMiddleware('/v1',{
      target: 'https://entitlements.auth.riotgames.com/api/token', // server 주소를 넣어주면 된다.
      changeOrigin: true,
    })
  );

  app.use(
    createProxyMiddleware('/userinfo',{
      target: 'https://auth.riotgames.com', // server 주소를 넣어주면 된다.
      changeOrigin: true,
    })
  );

  app.use(
    createProxyMiddleware('/storefront',{
      target: 'https://pd.kr.a.pvp.net/store/v2', // server 주소를 넣어주면 된다.
      changeOrigin: true,
    })
  );

  app.use(
    createProxyMiddleware('/store/v1/offers',{
      target: 'https://pd.kr.a.pvp.net', // server 주소를 넣어주면 된다.
      changeOrigin: true,
    })
  );


  app.use(
    createProxyMiddleware('/logout',{
      target: 'https://auth.riotgames.com', // server 주소를 넣어주면 된다.
      changeOrigin: true,
    })
  );
};