const mongoose = require('mongoose');
const ApiError = require('../error/ApiError');

/**
 * to be deleted
 * Request data should be exists on the model 
 * @param {Object} params the request data.
 * @param {Model} model the model to compare params with
 * @returns {Object} the list of params that exists on the model
 */
module.exports = function(queries, model) {
    const query = {};

    const { cols, vals } = queries;
    
    for (let i = 0; i < cols?.length; i++) {
        const col = cols[i];

        if (!vals[i]) continue;

        if (model[col] instanceof mongoose.SchemaTypes.String) { 
            query[col] = { $regex: '.*' + vals[i].toString() + '*.', $options: 'i' };
        } else if (
            model[col] instanceof mongoose.SchemaTypes.ObjectId || 
            model[col] instanceof mongoose.SchemaTypes.Boolean ||
            model[col] instanceof mongoose.SchemaTypes.Number
        ) {
            //TODO: separate & add validation
            query[col] = vals[i];
        } else if (model[col] instanceof mongoose.SchemaTypes.DocumentArray) {
            //TODO
        } else if (model[col] instanceof mongoose.SchemaTypes.Array) {
            try {
                const val = JSON.parse(vals[i]);
                if (Array.isArray(val)) {
                    query[col] = { $in: val };
                } else {
                    throw ApiError.badRequest(col + ' must be array');
                }
            } catch(e) {
                throw ApiError.badRequest(col + ' must be valid JSON object');
            }
        }
    }

    return query;
}