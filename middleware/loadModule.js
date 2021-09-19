const mongoose = require('mongoose');
const ApiError = require('../error/ApiError');

/**
 * This set the current module being access
 * @param {Router} router 
 * @param {String} moduleCode 
 * @returns {Function} returns a function that will fetch the current module
 */
module.exports = function(moduleCode) {
    return async (_, res, next) => {
        const module = await mongoose.model('module').findOne({code: moduleCode});
        
        if (!module) {
            next(ApiError.badRequest('module doesn\'t exists'));
            return;
        }

        res.locals.module = module;
        next();
    };
};