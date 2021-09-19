const express = require('express');
const { checkAccess, loadModule, loadUser, validateID } = require('../../middleware');
const { Action } = require('../../constant');
const UserController = require('../../controller/user');

const router = express.Router();

router.get('/me/getProfile', loadUser, UserController.getProfile);
router.patch('/me/changePassword', loadUser, UserController.changePassword);
router.patch('/changePassword/:token', UserController.changePasswordToken);
router.post('/requestChangePassword/:id', UserController.requestChangePassword);
router.patch('/setDefaultPassword/:id', [loadUser, loadModule('user'), validateID, checkAccess(Action.Edit)], UserController.setDefaultPassword);

module.exports = router;