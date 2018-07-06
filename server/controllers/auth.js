const axios = require('axios');
const crypto = require('crypto');

const secret = process.env.CRYPTO_SECRET;

const googleAuth = async (ctx) => {
  const q = ctx.request.query;
  //TODO: Exchange code for keys

  const {tokens} = await ctx.googleAuth.oauth2Client.getToken(q.code);
  //TODO: Get email from plus
  try {
    const user = await axios.get('https://www.googleapis.com/plus/v1/people/me', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`
      }
    });
    const cipher = crypto.createCipher('aes192', secret);
    let encryptedRefreshToken = cipher.update(tokens.refresh_token, 'utf8', 'hex');
    encryptedRefreshToken += cipher.final('hex');
    ctx.db.knex('sstokens').insert({
      reftok: encryptedRefreshToken,
      acctok: tokens.access_token,
      expiry: tokens.expiry_date,
      account: user.data.id,
      email: user.data.emails[0].value
    });
  } catch (e) {
    console.log(e);
  }
};

const getAccounts = async (ctx) => {
  if (ctx.isAuthenticated()) {
    try {
      const accounts = await ctx.db.knex('sstokens').select('*');
      ctx.body = {accounts};
    }
    catch (e) {
      ctx.throw(e);
    }
  } else {
    ctx.body = {success: false};
    ctx.throw(401);
  }
};

module.exports = {
  googleAuth,
  getAccounts,
};
