const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const rawModels = require('../models');
const modelCommonHook = require('../helper/modelCommonHook');

module.exports = function() {  
    const events = ['save', 'updateOne', 'findOneAndUpdate'];

    const models = {};

    for (let i in rawModels) {
        const schema = rawModels[i].schema;
        schema.plugin(uniqueValidator, { type: 'unique', message: '{PATH} must be unique', path: '{PATH}' });

        for (let ref of rawModels[i].refs) {
            const commonHook = modelCommonHook(...ref);
            for (let event of events) {
                schema.post(event, commonHook);
            }
        }

        models[i] = mongoose.model(i, schema);
    }

    return models;
};