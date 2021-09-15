const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const User = require('./user');

const { generateCommonHook } = require('../helper/db');

const accessSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    company: {
        type: mongoose.ObjectId,
        ref: 'company',
        required: true
    },
    description: { type: String },
    users: [{ type: mongoose.ObjectId }],
    details: [
        {
            action: { 
                type: String, 
                required: true 
            },
            module: {
                type: mongoose.ObjectId,
                ref: 'module',
                required: true
            }
        }
    ]
}, { timestamps: true });

accessSchema.index({ 'company': 1, 'name': 1 }, { unique: true });
accessSchema.index({ '_id': 1, 'details.action': 1, 'details.module': 1 }, { unique: true, sparse: true });
accessSchema.plugin(uniqueValidator, { type: 'unique', message: '{PATH} must be unique', path: '{PATH}' });

const insertModule = generateCommonHook('users', 'accesses', User);
accessSchema.post('save', insertModule);
accessSchema.post('update', insertModule);

module.exports = mongoose.model('access', accessSchema);