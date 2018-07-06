const Router = require('koa-router');
const router = new Router();
const Ctrl = require('../controllers/auth');
router.get('/goog', Ctrl.googleAuth);
router.get('/accounts', Ctrl.getAccounts);

module.exports = router.routes();
