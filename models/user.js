const mongoose = require('mongoose');
const hashPassword = require('../helper/hashPassword');

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
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'access'
    }],
    company: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'company',
        required: true
    },
    employee: {
        type: mongoose.SchemaTypes.ObjectId,
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

userSchema.index({ username: 1, company: 1 }, { unique: true });
const update = function(next) {
    const update = { ...this.getUpdate() };

    if (update?.password) {
        update.password = hashPassword(update.password);
        this.setUpdate(update);
    }

    next();
};

userSchema.pre('updateOne', update);
userSchema.pre('findOneAndUpdate', update);
userSchema.pre('save', function(next) {
    if (this.password) {
        this.password = hashPassword(this.password);
    }

    next();
});

module.exports = {
    schema: userSchema,
    refs: [['accesses', 'users', 'access']]
};