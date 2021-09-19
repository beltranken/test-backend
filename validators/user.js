const Joi = require('joi');
const { rxObjectId } = require('../constant');

const add = Joi.object({
    username: Joi
        .string()
        .alphanum()
        .min(4)
        .max(30)
        .required(),
    password: Joi
        .string()
        .min(4)
        .max(30)
        .required(),
    accesses: [Joi
        .string()
        .pattern(rxObjectId)
        .required()
        .optional()
    ],
    company: Joi
        .string()
        .pattern(rxObjectId)
        .required(),
    employee: Joi
        .string()
        .pattern(rxObjectId)
        .optional()
});

const edit = Joi.object({
    username: Joi
        .string()
        .alphanum()
        .min(4)
        .max(30)
        .optional(),
    email: Joi
        .string()
        .optional(),
    accesses: [Joi
        .string()
        .pattern(rxObjectId)
        .required()
        .optional()
    ],
    employee: Joi
        .string()
        .pattern(rxObjectId)
        .optional()
});

const requestChangePassword = Joi.object({
    username: Joi
        .string()
        .alphanum()
        .min(4)
        .max(30)
        .required(),
    company: Joi
        .string()
        .pattern(rxObjectId)
        .required()
});

const changePassword = Joi.string().min(4).max(30).required();

module.exports = {
    add,
    edit,
    requestChangePassword,
    changePassword
};