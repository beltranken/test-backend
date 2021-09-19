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

module.exports = {
    getErrorMsg
};