const Joi = require('joi');
const { rxObjectId } = require('../constant');

const insert = Joi.object({
    name: Joi
        .string()
        .max(50)
        .required(),
    description: Joi
        .string()
        .max(500)
        .optional(),
    company: Joi
        .string()
        .pattern(rxObjectId)
        .required(),
    users: Joi
        .array()
        .items(Joi
            .string()
            .pattern(rxObjectId)   
        ),
    details: Joi
        .array()
        .items(Joi.object({
            action: Joi
                .string()
                .max(30)
                .required(),
            module: Joi
                .string()
                .pattern(rxObjectId)
                .required()
        }))
        .optional()    
});

const update = Joi.object({
    name: Joi
        .string()
        .max(50)
        .optional(),
    description: Joi
        .string()
        .max(500)
        .optional(),
    company: Joi
        .string()
        .pattern(rxObjectId)
        .optional(),
    users: Joi
        .array()
        .items(Joi
            .string()
            .pattern(rxObjectId)   
        )
        .optional(),
    details: Joi
        .array()
        .items(Joi.object({
            action: Joi
                .string()
                .max(30)
                .required(),
            module: Joi
                .string()
                .pattern(rxObjectId)
                .required()
        }))
        .optional()    
}).min(1);

module.exports = {
    insert,
    update
};