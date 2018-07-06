const Koa = require('koa');
const Router = require('koa-router');
const Logger = require('koa-logger');
const Cors = require('@koa/cors');
const BodyParser = require('koa-bodyparser');
const Helmet = require('koa-helmet');
const respond = require('koa-respond');
const passport = require('koa-passport');
const session = require('koa-session');
const formidable = require('koa2-formidable');

const db = require('./db');
const googleAuth = require('./googleAuth');

const app = new Koa();
const router = new Router();

if(process.env.NODE_ENV !== 'local'){
  app.use(require('koa-static')('./build'))
}

app.context.db = db;
app.context.googleAuth = googleAuth;

// console.log(app.context.googleAuth.url + '&prompt=consent');

googleAuth.checkTokens();

app.use(Helmet());

if (process.env.NODE_ENV !== 'production') {
  app.use(Logger());
}

// sessions
app.keys = [process.env.CRYPTO_SECRET];
app.use(session({}, app));

// using formidable for multi-part form data
app.use (formidable ({}));
// body parser
app.use(Cors());
app.use(BodyParser({
  enableTypes: ['json', 'form', 'text'],
  jsonLimit: '250mb',
  strict: false,
  onerror: function (err, ctx) {
    ctx.throw('body parse error', 422)
  }
}));

app.use(respond());

// passport
require('./passport');
app.use(passport.initialize());
app.use(passport.session());

// routes
require('./routes/index')(router);
app.use(router.routes());
app.use(router.allowedMethods());

module.exports = app;
