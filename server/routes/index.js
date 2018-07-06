module.exports = (router) => {
  router.prefix('/api/v1');
  router.use('/users', require('./users'));
  //Check that user is authenticated
  router.use((ctx, next) => {
      if (ctx.isAuthenticated()) {
        return next();
      } else {
        ctx.throw(401);
      }
  });
  router.use('/site', require('./site'));
  // Check google auth tokens
  router.use((ctx, next) => {
      ctx.googleAuth.checkTokens();
      return next();
  });
  router.use('/auth', require('./auth'));
  router.use('/ga', require('./ga'));
  router.use('/attribution', require('./attribution'));
};
