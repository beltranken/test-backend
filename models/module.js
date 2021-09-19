const mongoose = require('mongoose');

const moduleSchema = mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        require: true
    },
    group: {
        type: String
    },
    description: {
        type: String
    },
    companies: [
        {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'company',
            require: true
        }
    ]
}, { timestamps: true });

module.exports = {
    schema: moduleSchema,
    refs: [['companies', 'modules', 'company']]
};