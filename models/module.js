const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Company = require('./company');

const { generateCommonHook } = require('../helper/db');

const moduleSchema = mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    group: {
        type: String
    },
    description: {
        type: String
    },
    companies: [
        {
            type: mongoose.ObjectId,
            ref: 'company',
            require: true
        }
    ]
}, { timestamps: true });

moduleSchema.plugin(uniqueValidator, { type: 'unique', message: '{PATH} must be unique', path: '{PATH}' });

const insertModule =  generateCommonHook('companies', 'modules', Company);
moduleSchema.post('save', insertModule);
moduleSchema.post('update', insertModule);

module.exports = mongoose.model('module', moduleSchema);