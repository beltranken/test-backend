const Joi = require('joi');
const { rxObjectId } = require('../constant');

const schema = Joi.object({
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

module.exports = {
    login: schema
};