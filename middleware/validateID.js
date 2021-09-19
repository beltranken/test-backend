const Joi = require('joi');
const { rxObjectId } = require('../constant');
const ApiError = require('../error/ApiError');
const getErrorMsg = require('../helper/getErrorMsg');

module.exports = function(req, _, next) {
    const { id } = req.params;
    if (!id) {
        next(ApiError.badRequest('ID is missing'));
        return;
    }

    const { error } = Joi.string().pattern(rxObjectId).validate(id);
    if (error) {
        next(ApiError.unprocessable(getErrorMsg(error)));
        return;
    }

    next();
};