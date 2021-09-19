const mongoose = require('mongoose');

module.exports = function(localColumn, foreignColumn, modelName) {
    return async function(doc, next) {   
        if (doc[localColumn]?.length > 0) {
            const data = doc[localColumn].map(m => m._id);
            await mongoose.model(modelName).updateMany({ _id: { $in : data } }, {
                $addToSet: { [foreignColumn]: doc._id }
            });
        }
        
        next();
    };
};