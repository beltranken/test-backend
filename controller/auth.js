const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const ApiError = require('../error/ApiError');
const AuthValidator = require('../validators/auth');
const getErrorMsg = require('../helper/getErrorMsg');

const expiresIn = 24 * 60 * 60000;

class AuthController {
    constructor() { }

    async token(req, res, next) {
        const User = mongoose.model('user');
        const refreshToken = req.body?.token;
    
        if (!refreshToken) {
            next(ApiError.badRequest('Token is missing'));
            return;
        }
    
        const user = await User.findOne({ refreshTokens:{ $elemMatch: { token: refreshToken }}}).select('+refreshTokens +password');
        if (!user) {
            next(ApiError.unprocessable('User doesn\'t exists'));
            return;
        }

        const i = user.refreshTokens.findIndex(e => e.token === refreshToken);
        try {
            await jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET + user.password + user.refreshTokens[i].device);
        } catch(e) {
            next(ApiError.unprocessable('Invalid token'));
        }

        const accessToken = generateAccessToken({ userId: user._id, device:  user.refreshTokens[i].device});
        user.refreshTokens[i].lastUsed = Date.now();
        await user.save();
    
        res.json({ accessToken: accessToken, expiresIn: Date.now() + expiresIn });
    } 
    
    async login(req, res, next) {
        const User = mongoose.model('user');

        const { error, value: { username, password, device, company } } = AuthValidator.login.validate(req.body);
        if (error) {
            next(ApiError.unprocessable(getErrorMsg(error)));
            return;
        }

        const user = await User.findOne({ username: username, company: company }).select('+password +refreshTokens');
        if (!user) {
            next(ApiError.unauthorized('Incorrect username or password'));
            return;
        }

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) {
            next(ApiError.unauthorized('Incorrect username or password'));
            return;
        }

        //TODO: validate device format
        const payload = { userId: user._id, device: device };
        const accessToken = generateAccessToken(payload);
        
        const refreshTokenPayload = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET + user.password + device);
        user.lastLogin = Date.now();
        user.refreshTokens = user.refreshTokens?.filter(token => token.device !== device);
        user.refreshTokens.push({ token: refreshTokenPayload, device: device });
        
        await user.save({ timestamps: false });

        res.status(200).json({ accessToken: accessToken, refreshToken: refreshTokenPayload, expiresIn: Date.now() + expiresIn });
    }
    
    async logout(req, res, next) {
        const User = mongoose.model('user');

        const token = req.body?.token;
        const user = res.locals.user;
        
        if (!token) {
            next(ApiError.badRequest('Token is missing'));
            return;
        }

        await User.findByIdAndUpdate(
            user?._id,
            { $pull: { refreshTokens : { token: token }}}
        );
        
        res.json({message: 'Logout successful'});
    }
}

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: expiresIn + 'm' });
}

module.exports = new AuthController();