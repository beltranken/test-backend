const mongoose = require('mongoose');

/**
 * Check if the user have access to the specific module and action
 * @param {Schema} user the user that will be check
 * @param {ObjectId} module the module that 
 * @param {String} action the action to be check
 * @returns {Boolean || Error} true if the user have access, error object if the user doesn't have 
 */
module.exports = async function(user, module, action) {
    if (!user?.company) return false;
    if (user.isSuper) return action;
    if (!user.company?.modules.includes(module)) return action;
    
    const accesses = user.accesses || [];
    const result = (await mongoose.model('access').exists({
        _id: { $in:  accesses},
        'details.action': action,
        'details.module': module
    }));

    if (!result) return false;

    return action;
};