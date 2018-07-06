const {google} = require('googleapis');
const db = require('./db');
const axios = require('axios');
const crypto = require('crypto');
const secret = process.env.CRYPTO_SECRET;
var querystring = require('querystring');

// Create URLs for new tokens
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOG_CLIENT_ID,
  process.env.GOOG_CLIENT_SECRET,
  process.env.GOOG_CLIENT_REDIRECT
);

// generate a url that asks permissions for Google+ and Google Calendar scopes
const scopes = [
  'https://www.googleapis.com/auth/analytics.readonly',
  'https://www.googleapis.com/auth/plus.login',
  'https://www.googleapis.com/auth/plus.me',
  'https://www.googleapis.com/auth/userinfo.email'
];

const url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes
});

const getToken = async (accountId) => {
  try {
    // const tokens = await db.query(`SELECT * FROM sstokens WHERE account = '${accountId}';`);
    const tokens = await db.knex('sstokens').select('*').where({account:accountId});
    if (tokens) {
      return tokens[0].acctok;
    } else {
      throw('Token Lookup Error')
    }
  } catch (e) {
    throw(e)
  }
};

const getTokens = async () => {
  try {
    const tokens = await db.knex.select('*').from('sstokens');
    if (tokens) {
      return tokens;
    } else {
      throw('Token Lookup Error')
    }
  } catch (e) {
    throw(e)
  }
};



const refreshAccessToken = async (refresh_token_encrypted) => {
  const decipher = crypto.createDecipher('aes192', secret);
  let refresh_token = decipher.update(refresh_token_encrypted, 'hex', 'utf8');
  refresh_token += decipher.final('utf8');
  try {

    const new_token = await axios.post('https://www.googleapis.com/oauth2/v4/token', querystring.stringify({
      client_id: process.env.GOOG_CLIENT_ID,
      client_secret: process.env.GOOG_CLIENT_SECRET,
      refresh_token,
      grant_type: 'refresh_token'
    }));
    return new_token;
  } catch (e) {
    console.log(e);
  }
};

const checkTokens = async () => {
  try {
    console.log('Checking Account Tokens');
    const tokens = await getTokens();
    for (token of tokens) {
      if (token.expiry <= Date.now()) {
        console.log('Updating Access Token for Account: ' + token.email);
        const newToken = await refreshAccessToken(token.reftok);
        if (newToken.data.access_token) {
          const expiry = Date.now() + (newToken.data.expires_in * 1000);
          // const update = await db.query(`UPDATE sstokens SET (acctok, expiry) = ('${newToken.data.access_token}', '${expiry}') WHERE account = '${token.account}';`);
          const update = await db.knex('sstokens').where({account:token.account}).update({acctok:newToken.data.access_token, expiry:expiry});
        } else {
          throw('Failed to Update Access Token')
        }
      }
    }
  } catch (e) {
    throw(e);
  }
};

module.exports = {
  url,
  oauth2Client,
  getTokens,
  refreshAccessToken,
  checkTokens,
  getToken
};
