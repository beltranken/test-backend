const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Access = require('./access');

const { generateCommonHook } = require('../helper/db');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    isSuper: {
        type: Boolean,
        default: false
    },
    lastLogin: {
        type: Date
    },
    email: {
        type: String
    },
    accesses: [{
        type: mongoose.ObjectId,
        ref: 'access'
    }],
    company: {
        type: mongoose.ObjectId,
        ref: 'company',
        required: true
    },
    employee: {
        type: mongoose.ObjectId,
        ref: 'employee'
    },
    refreshTokens: {
        type: [{
            token: {
                type: String,
                required: true
            },
            device: {
                type: String,
                required: true
            },
            lastUsed: {
                type: Date,
                default: Date.now,
                expires: 604800
            }
        }],
        select: false
    }
}, { timestamps: true });

userSchema.plugin(uniqueValidator, { type: 'unique', message: '{PATH} must be unique', path: '{PATH}' });
userSchema.index({ username: 1, company: 1 }, { unique: true });

const insertModule = generateCommonHook('accesses', 'users', Access);
userSchema.post('save', insertModule);
userSchema.post('update', insertModule);

module.exports = mongoose.model('user', userSchema);