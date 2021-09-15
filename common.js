const Access = require('./models/access');

/**
 * All API error return should come from this function
 * @param {Object} err the catch error object
 * @returns {Object} returns status code and error object
 */
function getErrorMsg(err) {
    //console.error(err);
    
    let code = 500;
    let message = [{  message: 'Something went wrong.' }];
    
    if (err?.name == 'ValidationError' && err?.errors) {
        message = [];
        for (let [, error] of Object.entries(err.errors)) {
            message.push({ kind: error.kind, column: error.path, message: error.message });
        }
    } else if (err?.details) {
        code = 422;
        message = err.details;
    } else if (err?.code) {
        code = err.code;
        message = [err.message];
    } else {
        code = 422;
        message = [err.message];
    }

    return { code, message };
}

/**
 * Check if the user have access to the specific module and action
 * @param {Schema} user the user that will be check
 * @param {ObjectId} module the module that 
 * @param {String} action the action to be check
 * @returns {Boolean || Error} true if the user have access, error object if the user doesn't have 
 */
async function checkUserAccess(user, module, action) {
    if(!user?.company) return false;
    if(user.isSuper) return true;
    if(!user.company?.modules.includes(module)) return true;

    try {
        const accesses = user.accesses || [];
        return (await Access.exists({
            _id: { $in:  accesses},
            'details.action': action,
            'details.module': module
        }));
    } catch(e) {
        return false;
    }
}

module.exports = {
    getErrorMsg,
    checkUserAccess
};