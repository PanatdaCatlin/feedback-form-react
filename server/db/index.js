const PG_CONN_STR = (process.env.PG_CONN_STRING || `postgres://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`)

const knex = require('knex')({
  client: 'pg',
  connection:PG_CONN_STR,
});


module.exports = {
  knex,
};
