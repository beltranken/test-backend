const mongoose = require('mongoose');
const ApiError = require('../error/ApiError');
const prepareQuery = require('../helper/prepareQuery');

module.exports = function(req, res, next) {
    const { module: { code }, user } = res.locals;
    const { cols, conds, vals, pageNumber } = req.query;
    const model = mongoose.model(code);

    if (!model) {
        next(ApiError.internal('Model ' + code + ' doesn\'t exists'));
        return;
    }

    const limit = 10;
    res.locals.page = { skip: (parseInt(pageNumber) || 0) * limit, limit };

    try {
        const query = prepareQuery({ conds, cols, vals }, model.schema.paths);
        if (!user?.isSuper) query.company = user.company?._id;
        res.locals.query = query;
        next();
    } catch(e) {
        next(e);
    }
};