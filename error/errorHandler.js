const ApiError = require('./ApiError');

module.exports = function (err, req, res, _) {
    console.error(err);
    if (err instanceof ApiError) {
        res.status(err.code).json(err.message);
        return;
    }

    //TODO: Send notification to admin

    res.status(500).json('something went wrong');
};