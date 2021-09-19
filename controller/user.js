const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const UserValidator = require('../validators/user');
const ApiError = require('../error/ApiError');
const getErrorMsg = require('../helper/getErrorMsg');

class UserController {
    constructor() { }

    async getProfile(_, res, next) {
        const { user } = res.locals;

        if (!user) {
            next(ApiError.internal('Middleware loadUser is required'));
            return;
        }

        res.json(user);
    }
    
    async changePassword(req, res, next) {
        const { user } = res.locals;
        const { password } = req.body;

        if (!user) {
            next(ApiError.internal('Middleware loadUser is required'));
            return;
        }

        try {  
            const saveUser = changePassword(user._id, password);
            res.json(saveUser);
        } catch(e) {
            next(e);
        }
    }

    async changePasswordToken(req, res, next) {
        const { token } = req.params;
        const { password} = req.body;
        let userId;

        if (!token) {
            next(ApiError.badRequest('Token is missing'));
            return;
        }

        try {
            const authData = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            userId = authData.userId;
        } catch(e) {
            console.log(e);
            next(ApiError.unprocessable('Invalid token'));
            return;
        }
    
        try{
            const user = changePassword(userId, password);
            res.json(user);
        } catch(e) {
            next(e);
        }
    }

    async requestChangePassword(req, res, next) {
        //TODO: maybe add additional checks? / send the token via email        
        const { error, value: { username, company }} = UserValidator.requestChangePassword.validate(req.body);
        if (error) {
            next(ApiError.unprocessable(getErrorMsg(error)));
            return;
        }
    
        const user = await mongoose.model('user').findOne({ username, company}).projection({ '_id': 1 });
        if (!user) {
            next(ApiError.unprocessable('User not found'));
            return;
        }
    
        const token = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        
        res.json({ token: token });
    }

    async setDefaultPassword(req, res, next) {
        const { id } = req.params;

        if(!id) {
            next(ApiError.internal('Middleware validateID is required'));
            return;
        }

        const currUser = await mongoose.model('user').findById(id);
        currUser.password = setDefaultPassword(currUser);
    
        try {
            const saveUser = await currUser.save();
            res.json(saveUser);
        } catch(e) {
            next(e);
        }
    }
}

function setDefaultPassword(user) {
    let password = '';

    if (!user.employee) {
        const month = ('0' + user.employee.birthdate?.getMonth());
        const year = user.employee.birthdate?.getYear();
        password = user.employee.firstName?.charAt(0) + user.employee?.lastName.replaceAll(' ', '') + month.substring(month.length - 2) + year;
    }

    if (!password) {
        password = user.username;
    }

    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);
    return hashPassword;
}

async function changePassword(userId, password) {
    if (password === undefined) throw ApiError.badRequest('Password is missing');

    const { value, error } = UserValidator.changePassword.validate(password);
    if (error) throw ApiError.unprocessable(error);

    return await mongoose.model('user').findByIdAndUpdate(userId, { password: value });
}

module.exports = new UserController();