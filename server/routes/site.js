const Router = require('koa-router');
const router = new Router();
const Ctrl = require('../controllers/site');

router.post('/feedback', Ctrl.feedback);

module.exports = router.routes();
