module.exports = function(error) {
    return error?.details?.map(d => d?.message) || [];
};