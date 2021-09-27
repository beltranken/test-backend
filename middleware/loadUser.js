const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const ApiError = require('../error/ApiError');

module.exports = async function(req, res, next) {
    let authData;

    try {
        const token = req.header('authorization')?.split(' ')[1];
        authData = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch(e) {
        next(ApiError.unauthorized('Invalid token'));
        return;
    }
    
    const user = await mongoose.model('user').findById(authData.userId).select('+refreshTokens').populate('company').exec();
    if (!user) {
        next(ApiError.unauthorized('User not found'));
        return;
    }

    // Check if the JWT has been invalidated
    if (!user?.refreshTokens.some(e => e.device === authData.device)) {
        next(ApiError.unauthorized('Invalid token'));
        return;
    }

    user.refreshTokens = undefined;
    res.locals.user = user;

    next();
};