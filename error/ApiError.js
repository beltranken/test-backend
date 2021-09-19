class ApiError extends Error {
    constructor(code, message, internal) {
        super(internal || message);
        Object.setPrototypeOf(this, new.target.prototype);

        this.code = code;
        this.message = message;
        this.internal = internal;

        Error.captureStackTrace(this);
    }

    static unauthorized(msg = 'missing or bad authentication') {
        return new ApiError(401, msg);
    }

    static forbidden(msg = 'permission denied') {
        return new ApiError(403, msg);
    }

    static unprocessable(msg) {
        return new ApiError(422, msg);
    }

    static badRequest(msg) {
        return new ApiError(400, msg);
    }

    static internal(msg) {
        return new ApiError(500, 'Something went wrong', msg);
    }
}

module.exports = ApiError;