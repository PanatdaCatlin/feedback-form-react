const Router = require('koa-router');
const router = new Router();
const Ctrl = require('../controllers/attribution');

router.post('/report/:metaAccountId', Ctrl.report);
router.post('/report', Ctrl.pyReport);

module.exports = router.routes();


