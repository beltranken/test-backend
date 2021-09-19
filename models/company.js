const mongoose = require('mongoose');

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
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'module',
            required: true
        }
    ]
}, { timestamps: true });

module.exports = {
    schema: companySchema,
    refs: [['modules', 'companies', 'module']]
};