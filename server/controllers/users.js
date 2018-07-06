const bcrypt = require('bcrypt');
const passport = require('koa-passport');

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 160;

//TODO !!! esnure everything auth related is over SSL/TLS
// Add user to user table and salt/hash password with Argon2
const register = async (ctx) => {
  ctx.assert(ctx.request.body, 400, 'Missing Username and Password');
  ctx.assert(ctx.request.body.username, 400, 'Missing Username');
  ctx.assert(ctx.request.body.password, 400, 'Missing Password');
  //TODO: Validate Email
  try {
    const user = await ctx.db.knex('users').select('username').where({username:ctx.request.body.username});
    if (user.length !== 0) {
      ctx.throw(400, 'Email already registered')
    }
  } catch (err) {
    ctx.throw(500, err)
  }
  if (ctx.request.body.password.length < MIN_PASSWORD_LENGTH ||
    ctx.request.body.password > MAX_PASSWORD_LENGTH) {
    return ctx.throw(400,
      'Password must be between ' + MIN_PASSWORD_LENGTH + ' and ' +
      MAX_PASSWORD_LENGTH + ' characters long');
  }

  try {
    const hash = await bcrypt.hash(ctx.request.body.password, 10);
    const r = await ctx.db.knex('users').insert({username: ctx.request.body.username, email: ctx.request.body.username, hash:hash});
    ctx.ok(r.length);
  } catch (err) {
    ctx.throw(500, err)
  }

};

const logout = (ctx) => {
  if (ctx.isAuthenticated()) {
    ctx.logout();
    ctx.redirect('/');
  } else {
    ctx.body = { success: false };
    ctx.throw(401);
  }
};

const login = (ctx) => {
  const user = ctx.request.body;
  return passport.authenticate('local', (err, user, info, status) => {
    if (user) {
      ctx.googleAuth.checkTokens();
      ctx.login(user);
      ctx.ok({user})
    } else {
      ctx.status = 400;
      ctx.body = { status: 'error' };
    }
  })(ctx);
};

const status = (ctx) => {
  if (ctx.isAuthenticated()) {
    ctx.ok();
  } else {
    ctx.body = { success: false };
    ctx.throw(401);
  }
};

module.exports = {
  register,
  logout,
  login,
  status,
};
