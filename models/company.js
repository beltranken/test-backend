const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Module = require('./module');

const { generateCommonHook } = require('../helper/db');

const companySchema = mongoose.Schema({
    code: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
    isSuper: {
        type: Boolean
    },
    modules: [
        {
            type: mongoose.ObjectId,
            ref: 'module',
            required: true
        }
    ]
}, { timestamps: true });

companySchema.plugin(uniqueValidator, { type: 'unique', message: '{PATH} must be unique', path: '{PATH}' });

const insertModule = generateCommonHook('modules', 'companies', Module);
companySchema.post('save', insertModule);
companySchema.post('update', insertModule);

module.exports = mongoose.model('company', companySchema);