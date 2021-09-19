const router = require('express').Router();
const { loadUser } = require('../../middleware');

const AuthController = require('../../controller/auth');

router.post('/token', AuthController.token);
router.post('/login', AuthController.login);
router.post('/logout', loadUser, AuthController.logout);

module.exports = router;