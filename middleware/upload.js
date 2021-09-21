const multer = require('multer');
const fs = require('fs-extra');
const ApiError = require('../error/ApiError');

let fullFileUploadPath = '';
const fileSize = 1 * 1000 * 1000;

const storage = multer.fileStorage({
    destination: (req, file, cb) => {
        fs.mkdir(fullFileUploadPath);
        cb(null, fullFileUploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + file.originalname);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: process.env.FILE_SIZE || fileSize }
});

module.exports = (req, res, next) => {
    const { module: code } = res.locals;
    
    fullFileUploadPath = process.env.FILE_BASE_PATH + code;

    upload(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            next(ApiError.internal('Multer Error'));
            return;
        } else if (err) {
            //unknown error
            next(err);
            return;
        }

        next();
    });
};