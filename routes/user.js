const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getErrorMsg, checkUserAccess } = require('../common');
const basicRouter = require('../helper/basicRouter');

const User = require('../models/user');
const UserValidator = require('../validators/User');

const router = express.Router();

router.use('', basicRouter.prepareModule('user'));
router.get('', basicRouter.search(User));
router.get('/:id', basicRouter.locator(User));
router.patch('/:id', basicRouter.update(User, UserValidator));
router.post('', async (req, res) => {
    try {
        const { user, module } = res.locals;
        if(!await checkUserAccess(user, module._id, 'add')) throw {code: 403, message: 'Access denied'};

        const value = {
            username: req.body?.username,
            password: req.body?.password,
            company: req.body?.company,
            employee: req.body?.employee,
            email: req.body?.email
        };
        if(!user?.isSuper) value.company = user.company?._id;

        UserValidator.insert.validate(value);

        const salt = await bcrypt.genSalt(10);
        value.password = await bcrypt.hash(value.password, salt);
        
        const currUser = new User(value);
        const savedUser = await currUser.save();
        res.json(savedUser);
    } catch(err) {
        const ret = getErrorMsg(err);
        res.status(ret.code).json(ret.message);
    }
});

router.patch('/changePassword', async (req, res) => {
    try {
        const { user } = res.locals?.user;
        if(!user) throw {code: 422, message: 'No user'};
        
        const saveUser = changePassword(user._id, req.body?.password);
        
        res.json(saveUser);
    } catch(err) {
        const ret = getErrorMsg(err);
        res.status(ret.code).json(ret.message);
    }
});

router.patch('/changePassword/:token', async (req, res) => {
    try {
        const { userId } = await jwt.verify(req.params?.token, process.env.ACCESS_TOKEN_SECRET);
        const user = changePassword(userId, req.body?.password);
        res.json(user);
    } catch(err) {
        const ret = getErrorMsg(err);
        res.status(ret.code).json(ret.message);
    }
});

router.post('/requestChangePassword/:userId', async (req, res) => {
    try {
        //TODO: maybe add additional checks? / send the token via email
        const { username, company } = req.body;
        
        UserValidator.requestChangePassword.validate({ username, company });

        const user = await User.findOne({ username, company }).projection({ '_id': 1 });
        if(!user) throw {code: 422, message: 'Cannot find the user'};

        const token = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        
        res.json({ token: token});
    } catch(err) {
        const ret = getErrorMsg(err);
        res.status(ret.code).json(ret.message);
    }
});

router.patch('/setDefaultPassword/:userId', async (req, res) => {
    try {
        const { user, module } = res.locals;
        if(!await checkUserAccess(user, module._id, 'view')) throw {code: 403, message: 'Access denied'};

        const currUser = await User.findById(req.params?.userId);
        currUser.password = setDefaultPassword(currUser);

        const saveUser = await currUser.save();
        res.json(saveUser);
    } catch(err) {
        const ret = getErrorMsg(err);
        res.status(ret.code).json(ret.message);
    }
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

    UserValidator.changePassword.validate(password);

    const salt = await bcrypt.genSalt(10);
    const hashPass = await bcrypt.hash(password, salt);
    const user = await User.findByIdAndUpdate(userId, {
        password: hashPass
    });
    return user;
}

module.exports = router;