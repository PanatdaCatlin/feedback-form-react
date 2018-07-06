const axios = require('axios');

const listVars = async (ctx) => {
  console.log(ctx.params);
  const access_token = await ctx.googleAuth.getToken(ctx.params.metaAccountId);
  switch (Object.keys(ctx.params).length) {
    case 1:
      try {
        const response = await axios.get('https://www.googleapis.com/analytics/v3/management/accounts', {
          headers: {
            Authorization: `Bearer ${access_token}`
          }
        });
        if(response.data) {
          ctx.body = response.data.items;
        } else {
          ctx.throw(400);
        }
      } catch (e) {
        ctx.throw(400);
      }
      break;
    case 2:
      try {
        const response = await axios.get(`https://www.googleapis.com/analytics/v3/management/accounts/${ctx.params.accountId}/webproperties`, {
          headers: {
            Authorization: `Bearer ${access_token}`
          }
        });
        if(response.data) {
          ctx.body = response.data.items;
        } else {
          ctx.throw(400);
        }
      } catch (e) {
        ctx.throw(400);
      }
      break;
    case 3:
      try {
        const response = await axios.get(`https://www.googleapis.com/analytics/v3/management/accounts/${ctx.params.accountId}/webproperties/${ctx.params.propertyId}/profiles`, {
          headers: {
            Authorization: `Bearer ${access_token}`
          }
        });
        if(response.data) {
          ctx.body = response.data.items;
        } else {
          ctx.throw(400);
        }
      } catch (e) {
        ctx.throw(400);
      }
      break;
    default:
      break;
  }
};

const listGoals = async (ctx) => {
  console.log(ctx.request.query);
  const access_token = await ctx.googleAuth.getToken(ctx.request.query.metaAccountId);
  try {
    const response = await axios.get(`https://www.googleapis.com/analytics/v3/management/accounts/${ctx.request.query.accountId}/webproperties/${ctx.request.query.webPropertyId}/profiles/${ctx.request.query.profileId}/goals`, {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });
    if(response.data) {
      ctx.body = response.data.items;
    } else {
      ctx.throw(400);
    }
  } catch (e) {
    ctx.throw(400);
  }
};

module.exports = {
  listVars,
  listGoals
};
