
function generateCommonHook(localColumn, foreignColumn, foreignSchema) {
    return async (doc, next) => {
        const cond0 = Array.isArray(doc[localColumn]);
        const cond1 = cond0 && doc[localColumn]?.length > 0;
        const cond2 = !cond0 && doc[localColumn];
        
        if (cond1 || cond2) {
            const data = (cond1 ? doc[localColumn].map(m => m._id) : doc);
            await foreignSchema.updateMany({ _id: { $in : data } }, {
                $addToSet: { [foreignColumn]: doc._id }
            });
        }    

        next();
    };
}

module.exports = {
    generateCommonHook
};