const Joi = require('joi');
const { rxObjectId } = require('../constant');

const add = Joi.object({
    code: Joi
        .string()
        .alphanum()
        .max(50)
        .required(),
    name: Joi
        .string()
        .max(50)
        .required(),
    modules: Joi
        .array()
        .items(Joi
            .string()
            .pattern(rxObjectId)
        )
});

const edit = Joi.object({
    code: Joi
        .string()
        .alphanum()
        .max(50)
        .optional(),
    name: Joi
        .string()
        .max(50)
        .optional(),
    modules: Joi
        .array()
        .items(Joi
            .string()
            .pattern(rxObjectId)
        )
        .optional()
}).min(1);

module.exports = {
    add,
    edit
};