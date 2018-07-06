//TODO : REFACTOR ALL THIS STUFF
const Axios = require('axios');
const fs = require('fs');
const zlib = require('zlib');
const FormData = require('form-data');
var http = require('http');

const pad = (n, width, z) => {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};

const get_MCF = async (uri, access_token, maxResults) => {
  const url = uri + `&max-results=${maxResults}`;
  try {
    const response = await Axios.get(url, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Encoding': 'gzip',
        'User-Agent': 'axios (gzip)'
      }
    });
    return response.data;
  } catch (err) {
    if (err.response.data.error.errors[0].reason === 'responseTooLarge' && maxResults > 1000) {
      console.log('Backing off on response size')
      return get_MCF(uri, access_token, Math.floor(maxResults / 2))
    }
    else {

      throw err;
    }
  }
};

function classifyNode(node, grouping) {
  if (grouping === 'default') {
    switch (true) {
      case node.split(' / ')[1].match('organic') ? true : false :
        return 'Organic';
      case node.split(' / ')[1].match(/^(social|social-network|social-media|sm|social network|social media)$/g) ? true : false:
        return 'Social';
      case (node.split(' / ')[0].match('direct') || node.split(' / ')[1].match(/^(none)|(not set)/g)) ? true : false:
        return 'Direct';
      case node.split(' / ')[1].match(/^(display|cpm|banner)$/g) ? true : false :
        return 'Display';
      case node.split(' / ')[1].match('email') ? true : false :
        return 'Email';
      case node.split(' / ')[1].match(/^(cpv|cpa|cpp|content-text)$/g) ? true : false :
        return 'Other Advertising';
      case node.split(' / ')[1].match(/^(cpc|ppc|paidsearch)$/g) ? true : false :
        return 'Paid Search';
      case node.split(' / ')[1].match('referral') ? true : false :
        return 'Referral';
      case node.split(' / ')[1].match('affiliate') ? true : false :
        return 'Affiliate';
      default:
        return '(Other)';
    }
  } else if (grouping === 'providence') {
    switch (true) {
      case node.split(' / ')[1].match('organic') ? true : false :
        return 'Organic';
      case node.split(' / ')[1].match(/^(social|social-network|social-media|sm|social network|social media|social_organic|social_paid|influencer)$/g) ? true : false:
        return 'Social';
      case node.split(' / ')[0].match(/(facebook|twitter)/g) ? true : false:
        return 'Social';
      case (node.split(' / ')[0].match('direct') || node.split(' / ')[1].match(/^(none)/g)) ? true : false:
        return 'Direct';
      case node.split(' / ')[1].match(/^(display|cpm|banner|video_programmatic|video_premium_online|video_tv|audio_streaming|audio_terrestrial|print|out_of_home|other_paid|multi)$/g) ? true : false :
        return 'Media';
      case node.split(' / ')[1].match(/^(display|cpm|banner|video_programmatic|video_premium_online|video_tv|audio_streaming|audio_terrestrial|print|out_of_home|other_paid|multi)$/g) ? true : false :
        return 'Display';
      case node.split(' / ')[1].match('email') ? true : false :
        return 'Email';
      case node.split(' / ')[1].match(/^(cpv|cpa|cpp|content-text|sponsorship)$/g) ? true : false :
        return 'Other Advertising';
      case node.split(' / ')[1].match(/^(cpc|ppc|paidsearch)$/g) ? true : false :
        return 'Paid Search';
      case node.split(' / ')[1].match('referral') ? true : false :
        return 'Referral';
      default:
        return '(Other)';
    }
  } else {
    throw('Channel Grouping Not Set')
  }
}

async function pagination(uri, access_token, arr, total, maxResults, backoff) {
  const url = uri + `&max-results=${maxResults}`;
  backoff = backoff || 1;
  console.log(arr.length, total);
  if (arr.length < total) {
    try {
      const response = await Axios.get(url + `&start-index=${arr.length + 1}`, {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      });
      const newarr = response.data.rows;
      const a = arr.concat(newarr);
      return pagination(uri, access_token, a, total, 10000);
    } catch (err) {
      if (err.response.data.error.errors[0].reason === 'responseTooLarge' && maxResults > 1000) {
        console.log('Backing off on response size')
        return pagination(uri, access_token, arr, total, Math.floor(maxResults / 2));
      }
      const x = backoff + 1;
      console.log('Waiting ' + (1000 * (backoff ^ 2) + (Math.random() + 1)) + ' ms and retrying');
      if (backoff < 3) {
        setTimeout(function () {
          return pagination(uri, access_token, arr, total, 10000, x);
        }, (1000 * (backoff ^ 2) + (Math.random() + 1)));
      } else {
        throw err;
      }
    }
  } else {
    return arr;
  }
}

function parse_MCF(mcf, cgp, dm) {
  let output = [];
  mcf.map((row) => {
    const output_row = [];
    let steps = '';
    row[0].conversionPathValue.map((step, i) => {
      const action = classifyNode(step.nodeValue, cgp);

      if (dm === 'unknown') {
        if (action === 'Direct') {
          if (i === row[0].conversionPathValue.length - 1 && i === 0) {
            const push = i !== row[0].conversionPathValue.length - 1 ? `${'Unknown'} > ` : 'Unknown';
            steps += push;
          } else {
            const currPath = steps.split(' > ');
            if (currPath[currPath.length - 2] !== undefined) {
              const push = i !== row[0].conversionPathValue.length - 1 ? `${currPath[currPath.length - 2]} > ` : currPath[currPath.length - 2];
              if (push === 'undefined') {
                console.log('break')
              }
              steps += push;
            }
          }
        }
        else {
          const push = i !== row[0].conversionPathValue.length - 1 ? `${action} > ` : action;
          steps += push;
        }
      } else if (dm === 'default') {
        const push = i !== row[0].conversionPathValue.length - 1 ? `${action} > ` : action;
        steps += push;
      } else if (dm === 'first') {
        if (action === 'Direct' && true) {
          if (i === 0 && true) {
            const push = i !== row[0].conversionPathValue.length - 1 ? `${action} > ` : action;
            steps += push;
          } else {
            const currPath = steps.split(' > ');
            if (currPath[0] !== undefined) {
              const push = i !== row[0].conversionPathValue.length - 1 ? `${currPath[0]} > ` : currPath[0];
              if (push === 'undefined') {
                console.log('break')
              }
              steps += push;
            }
          }
        } else {
          const currPath = steps.split(' > ');
          if (currPath[currPath.length - 2] !== undefined) {
            const push = i !== row[0].conversionPathValue.length - 1 ? `${currPath[currPath.length - 2]} > ` : currPath[currPath.length - 2];
            if (push === 'undefined') {
              console.log('break')
            }
            steps += push;
          }
        }
      }
    });
    if (steps.slice(-3) === ' > ') {
      steps = steps.slice(0, -3)
    }
    if (steps.length !== 0) {
      output_row.push(steps, parseInt(row[2].primitiveValue), parseInt(row[3].primitiveValue));
      output.push(output_row);
    }
  });
  output = array_to_csv(output);
  return {json: mcf, csv: output};
}

function array_to_csv(array) {
  let pre_array = [];
  array.map((row, i) => {
    const temp_row = row.join(',');
    pre_array.push(i === 0 ? 'path,goalNumber,conversions\n' + temp_row : temp_row);
  });
  return pre_array.join('\n');
}

async function report(ctx) {
  ctx.req.setTimeout(0);
  // Validate user's access token
  if (ctx.params.metaAccountId) {
    const acc_token = await ctx.googleAuth.getToken(ctx.params.metaAccountId);

    // Build query URL
    const query = ctx.request.body;
    const maxResults = 10000;
    const uri = `https://www.googleapis.com/analytics/v3/data/mcf?ids=${query.ids}&metrics=${query.metrics}&start-date=${query.startDate}&end-date=${query.endDate}&dimensions=${query.dimensions}${query.filter? `&filters=mcf:conversionGoalNumber%3D%3D${pad(query.goalNumber, 3)}`:''}`;
    try {

      // GET MCF data
      let mcf = await get_MCF(uri, acc_token, 10000);
      // Handle pagination
      if (mcf.rows) {
        if (mcf.containsSampledData) {
          ctx.throw(413, 'GA Data Sampled')
        }
        if (mcf.totalResults > mcf.itemsPerPage) {
          mcf = await pagination(uri, acc_token, mcf.rows, mcf.totalResults, 10000);
        } else {
          mcf = mcf.rows;
        }
        // Write to CSV
        const parsedMcf = parse_MCF(mcf, query.cgp, query.dm);
        ctx.body = parsedMcf;

      } else {
        ctx.throw(500);
      }
    } catch (e) {
      console.log(e.response.data.error.code);
      ctx.throw(e.response.data.error.code ? e.response.data.error.code : 500)
    }
  } else {
    // Reject unauthorized users
    ctx.throw(401);
  }
}

const pyReport = async (ctx) => {
  const filename = 'mcf_' + (new Date() / 10).toString() + parseInt(Math.random() * 1000).toString() + '.csv';
  try {
    fs.writeFileSync(filename, ctx.request.body.csv);
    let formData = new FormData();
    formData.append('order', ctx.request.body.order);
    formData.append('goal', ctx.request.body.goal);
    formData.append('format', 'json');
    formData.append('key', ctx.request.body.key);
    formData.append('csv', fs.createReadStream('./' + filename));
    const res = await Axios.post(process.env.ATTR_HOST + '/api/v1/attribution-report',
      formData, {
        headers: formData.getHeaders(),
      });
    if (res.data) {
      fs.unlinkSync('./' + filename);
      ctx.body = res.data;
    } else {
      fs.unlinkSync('./' + filename);
      ctx.throw(500);
    }

  } catch (e) {
    fs.unlinkSync('./' + filename);
    if (e.response.status === 418) {
      ctx.throw(412, 'Insufficient Data for Processing')
    } else {
      throw(e);
    }
  }
};

module.exports = {
  report,
  pyReport
};
