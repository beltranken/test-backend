const mongoose = require('mongoose');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const UserValidator = require('../../validators');
const { checkAccess, loadModule, loadUser, validateID } = require('../../middleware');
const ApiError = require('../../error/ApiError');
const { Action } = require('../../constant');

const router = express.Router();

router.patch('/changePassword', loadUser, async (req, res, next) => {
    try {
        const { user } = res.locals.user;    
        const saveUser = changePassword(user._id, req.body?.password);
        res.json(saveUser);
    } catch(e) {
        next(e);
    }
});

router.patch('/changePassword/:token', async (req, res, next) => {
    let userId;
    try {
        const authData = await jwt.verify(req.params?.token, process.env.ACCESS_TOKEN_SECRET);
        userId = authData.userId;
    } catch(e) {
        next(ApiError.unprocessable('Invalid token'));
    }

    try{
        const user = changePassword(userId, req.body?.password);
        res.json(user);
    } catch(e) {
        next(e);
    }
});

router.post('/requestChangePassword/:userId', async (req, res, next) => {
    //TODO: maybe add additional checks? / send the token via email
    const { username, company } = req.body;
    
    const { value, error } = UserValidator.requestChangePassword.validate({ username, company });
    if (error) {
        next(ApiError.unprocessable(error));
        return;
    }

    const user = await mongoose.model('user').findOne(value).projection({ '_id': 1 });
    if (!user) throw {code: 422, message: 'Cannot find the user'};

    const token = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    
    res.json({ token: token});
});

router.patch('/setDefaultPassword/:id', [loadUser, loadModule('user'), validateID, checkAccess(Action.Edit)], async (req, res) => {
    const currUser = await mongoose.model('user').findById(req.params.id);
    currUser.password = setDefaultPassword(currUser);

    const saveUser = await currUser.save();
    res.json(saveUser);
});

async function setDefaultPassword(user) {
    let password = '';

    if (!user.employees) {
        const employee = user.employees.find(employee => employee.company === user.company);
        const month = ('0' + employee.birthdate.getMonth());
        const year = employee.birthdate.getYear();
        password = employee.firstName.charAt(0) + employee.lastName.replaceAll(' ', '') + month.substring(month.length - 2) + year;
    }

    if (!password) {
        password = user.username;
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    return hashPassword;
}

async function changePassword(userId, password) {
    if (password === undefined) throw ApiError.badRequest('Password is missing');

    const { value, error } = UserValidator.changePassword.validate(password);

    if (error) throw ApiError.unprocessable(error);

    return await mongoose.model('user').findByIdAndUpdate(userId, { password: value });
}

module.exports = router;