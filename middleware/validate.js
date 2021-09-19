const Validators = require('../validators'); 
const ApiError = require('../error/ApiError');

module.exports = function(req, res, next) {
    const { module: { code }, action, user } = res.locals;
    
    if (!action) {
        next(ApiError.internal('Module must be initialize before calling validate'));
        return;
    }

    if (!Validators[code]) {
        next(ApiError.internal('Module must have a validator'));
        return;
    }

    const validator = Validators[code][action];
    if (!validator) {
        next(ApiError.internal('Validator doesn\'t have property ' + action));
        return;
    }

    const { value, error } = validator.validate(req.body);
    if (error) {
        next(ApiError.unprocessable(error.details?.map(d => d?.message)));
        return;
    }
    
    if (!user?.isSuper) value.company = user.company?._id;
    res.locals.body = value;

    next();
};