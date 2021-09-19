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
    type: Joi
        .string()
        .max(50)
        .required(),
    description: Joi
        .string()
        .optional(),
    companies: Joi
        .array()
        .unique()
        .items(Joi
            .string()
            .pattern(rxObjectId)
        )
        .optional()
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
    type: Joi
        .string()
        .max(50)
        .optional(),
    description: Joi
        .string()
        .optional(),
    companies: Joi
        .array()
        .unique()
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