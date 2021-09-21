const ApiError = require('./ApiError');

module.exports = function (err, req, res, _) {
    console.error(err);
    if (err instanceof ApiError) {
        res.status(err.code).json(err.message);
        return;
    }

    //TODO: uncaught error, Send email notification to admin

    res.status(500).json({ message: 'something went wrong' });
};