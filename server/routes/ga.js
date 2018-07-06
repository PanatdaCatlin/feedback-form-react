const Router = require('koa-router');
const router = new Router();
const Ctrl = require('../controllers/ga');
// router.get('/account', Ctrl.googleAuth);
router.get('/account/:metaAccountId', Ctrl.listVars);
router.get('/account/:metaAccountId/:accountId', Ctrl.listVars);
router.get('/account/:metaAccountId/:accountId/:propertyId', Ctrl.listVars);
router.get('/goal', Ctrl.listGoals);

module.exports = router.routes();
