const mongoose = require('mongoose');

const accessSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    company: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'company',
        required: true
    },
    description: { type: String },
    users: [{ type: mongoose.SchemaTypes.ObjectId }],
    details: [
        {
            action: { 
                type: String, 
                required: true 
            },
            module: {
                type: mongoose.SchemaTypes.ObjectId,
                ref: 'module',
                required: true
            }
        }
    ]
}, { timestamps: true });

accessSchema.index({ 'company': 1, 'name': 1 }, { unique: true });
accessSchema.index({ '_id': 1, 'details.action': 1, 'details.module': 1 }, { unique: true, sparse: true });

module.exports = {
    schema: accessSchema,
    refs: [['users', 'accesses', 'user']]
};