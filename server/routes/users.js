const Router = require('koa-router');
const router = new Router();
const Ctrl = require('../controllers/users');

router.post('/register', Ctrl.register);
router.post('/login', Ctrl.login);
router.post('/logout', Ctrl.logout);
router.post('/status', Ctrl.status);

module.exports = router.routes();
