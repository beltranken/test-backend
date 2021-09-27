const ApiError = require('../error/ApiError');
const checkUserAccess = require('../helper/checkUserAccess');
const { ActionRank } = require('../constant');

module.exports = function(paramActions) {    
    let actions = paramActions;
    return async (_, res, next) => {      
        const { user, module } = res.locals;

        if (!actions) {
            next(ApiError.internal('Action must be a string or array of string'));
            return;
        }

        actions = (Array.isArray(actions)) ? actions : [actions];
        
        if (!module) {
            next(ApiError.internal('Module must be initialize before calling checkAccess'));
            return;
        }

        if (!user) {
            next(ApiError.internal('User must be initialize before calling checkAccess'));
            return;
        }

        const promises = [];
        for (let action of actions) promises.push(checkUserAccess(user, module._id, action));

        //Filter out the actions the user doesn't have permission
        const results = (await Promise.all(promises)).filter(a => a);
        if (results?.length > 0) {
            //Get the action with the highest rank
            const action = results.reduce((p, c) => (ActionRank[p] > ActionRank[c]) ? p : c);
            res.locals.action = action;
            next();
        } else {
            next(ApiError.forbidden());
        }
    };
};