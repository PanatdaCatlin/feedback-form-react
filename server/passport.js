const passport = require('koa-passport');
const LocalStrategy = require('passport-local').Strategy;
const db = require('./db');
const bcrypt = require('bcrypt');


const fetchUser = async (username) => {
  try {
    const userdata = await db.knex.select(['username', 'hash', 'id', 'approved']).from('users').where({username: username});
    if(userdata.length !== 1) throw(500);
    return {id: userdata[0].id, username: userdata[0].username, hash: userdata[0].hash, approved:userdata[0].approved}
  } catch (err) {
    throw(err);
  }
};

passport.serializeUser((user, done) => {
  done(null, user.id)
});

passport.deserializeUser(async (id, done) => {
  try {
    const userdata = await db.knex.select(['username', 'hash', 'id']).from('users').where({id: id});
    done(null, {id: userdata[0].id, username: userdata[0].username});
  } catch (err) {
    done(err);
  }
});

passport.use(new LocalStrategy(async (email, password, cb) => {
    try {
      const user = await fetchUser(email);
      const validitiy = await bcrypt.compare(password, user.hash);
      if (validitiy && user.approved) {
        const update = await db.knex('users').where({id:user.id}).update({last_accessed:db.knex.fn.now()});
        return cb(null, {id: user.id, username: user.username});
      }
      else return cb(null, false);
    } catch (err) {
      return cb(null, false);
    }
  }
));
