const Joi = require('joi');
const { rxObjectId } = require('../constant');

const insert = Joi.object({
    code: Joi
        .string()
        .alphanum()
        .max(50)
        .required(),
    name: Joi
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

const update = Joi.object({
    code: Joi
        .string()
        .alphanum()
        .max(50)
        .optional(),
    name: Joi
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

const schema = Joi
    .when(Joi.ref('$isNew'), {
        'is': true,
        'then': insert,
        'otherwise': update
    });

module.exports = schema;