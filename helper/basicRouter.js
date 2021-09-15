const mongoose = require('mongoose');
const express = require('express');

const Module = require('../models/module');
const { getErrorMsg, checkUserAccess } = require('../common');

/**
 * to be deleted
 * Request data should be exists on the model 
 * @param {Object} params the request data.
 * @param {Model} model the model to compare params with
 * @returns {Object} the list of params that exists on the model
 */
function prepareQuery(queries, model) {
    const query = {};

    const { cols, vals } = queries;
    
    for(let i = 0; i < cols?.length; i++) {
        const col = cols[i];

        if(!vals[i]) continue;

        if(model[col] instanceof mongoose.SchemaTypes.String) { 
            query[col] = { $regex: '.*' + vals[i].toString() + '*.', $options: 'i' };
        } else if(
            model[col] instanceof mongoose.SchemaTypes.ObjectId || 
            model[col] instanceof mongoose.SchemaTypes.Boolean ||
            model[col] instanceof mongoose.SchemaTypes.Number
        ) {
            //TODO: separate & add validation
            query[col] = vals[i];
        } else if(model[col] instanceof mongoose.SchemaTypes.DocumentArray) {
            //TODO
        } else if(model[col] instanceof mongoose.SchemaTypes.Array) {
            try {
                const val = JSON.parse(vals[i]);
                if (Array.isArray(val)) {
                    query[col] = { $in: val };
                } else {
                    throw new Error('Malformed query');
                }
            } catch(e) {
                throw new Error('Malformed query');
            }
        }
    }

    return query;
}

/**
 * This set the current module being access
 * @param {Router} router 
 * @param {String} moduleCode 
 * @returns {Function} returns a function that will fetch the current module
 */
function prepareModule(moduleCode) {
    return async (_, res, next) => {
        try {
            res.locals.module = await Module.findOne({code: moduleCode});
        } catch(e) {
            console.log(e);
        }
        next();
    };
}

function search(Model) {
    return async (req, res) => {
        try {
            /**
             * TODO: 
             *      - validate @sort and @limit 
             *      - use @sort
             *      - create token for version number? 
             */
            const { user, company, module } = res.locals;
            const { cols, conds, vals, page, sort, limit } = req.query;
    
            sort;
            if(!await checkUserAccess(user, module._id, 'view')) throw {code: 403, message: 'Access denied'};
    
            let skip = 0;
            if(page > 0) skip = page * limit;
    
            const query = prepareQuery({ conds, cols, vals }, Model.schema.paths);
            if (!user.isSuper) query.company = company._id;
            
            const data = await Model.find(query).skip(skip).limit(limit);
            const count = await Model.countDocuments(query);
    
            res.json({ count: count, data: data });
        } catch(err) {
            const ret = getErrorMsg(err);
            res.status(500).json(ret.message);
        }
    };
}

function locator(Model) {
    /**
     * TODO:    create token for version number? 
     */
    return async (req, res) => {
        try {
            const { user, module } = res.locals;
    
            let permission = '';
            const edit = await checkUserAccess(user, module._id, 'edit');
            const view = await checkUserAccess(user, module._id, 'view');
    
            if(edit) permission = 'edit';
            else if(view) permission = 'view';
            else throw { code: 403, message: 'Access denied' };
    
            const data = await Model.findById(req.params.id);
            res.json({ permission: permission, data: data || {} });
        } catch(err) {
            const ret = getErrorMsg(err);
            res.status(ret.code).json(ret.message);
        }
    
    };
}

function insert(Model, Validator) {
    return async (req, res) => {
        try {
            const { user, module } = res.locals;
            if(!await checkUserAccess(user, module._id, 'add')) throw {code: 403, message: 'Access denied'};
    
            const value = {
                name: req.body?.name,
                description: req.body?.description,
                details: req.body?.details,
                company: req.body?.company
            };
            if(!user?.company) value.company = user.company?._id;
            Validator.insert.validate(value);
    
            const access = new Model(value);
            const savedAccess = await access.save();
            res.json(savedAccess);
        } catch(err) {
            const ret = getErrorMsg(err);
            res.status(ret.code).json(ret.message);
        }
    };
}

function update(Model, Validator) {
    return async (req, res) => {
        try {
            /**
             * TODO: Validate the version number?
             */
            const { user, module } = res.locals;
            if(!await checkUserAccess(user, module._id, 'edit')) throw {code: 403, message: 'Access denied'};
    
            Validator.update.validate(req.body);
            const updatedAccess = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
            res.json(updatedAccess);
        } catch(err) {
            const ret = getErrorMsg(err);
            res.status(ret.code).json(ret.message);
        }
    };
}

function deleteRouter(Model) {
    return async (req, res) => {
        try {
            const { user, module } = res.locals;
            if(!await checkUserAccess(user, module._id, 'edit')) throw {code: 403, message: 'Access denied'};
    
            const access = await Model.findByIdAndRemove(req.params.id);
            res.json(access || {});
        } catch(err) {
            const ret = getErrorMsg(err);
            res.status(ret.code).json(ret.message);
        }
    };
}

module.exports = {
    prepareModule,
    search,
    locator,
    insert,
    update,
    deleteRouter,
    setup: function(moduleName, Model, Validator) {
        const router = express.Router();
    
        router.use('', prepareModule(moduleName));
        router.get('', search(Model));
        router.get('/:id', locator(Model));
        router.post('', insert(Model, Validator));
        router.patch('/:id', update(Model, Validator));
        router.delete('/:id', deleteRouter(Model));
    
        return router;
    }
};