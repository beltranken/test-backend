const CRUD = require('./CRUD');
const ApiError = require('../../error/ApiError');

class BasicCRUD extends CRUD {
    constructor(moduleName) {
        super(moduleName);
    }

    async search(_, res) {
        /**
         * TODO: 
         *      - use @sort
         *      - validate @sort and @limit 
         *      - create token for version number? 
         */
        const { query, page: { skip, limit } } = res.locals;
        const data = await this.Model.find(query).skip(skip).limit(limit);
        const count = await this.Model.countDocuments(query);

        res.json({ count: count, data: data || [] });
    }

    async locator(req, res) {
        const { action } = res.locals;
        const { id } = req.params;
        
        const data = await this.Model.findById(id);
        res.json({ action, data: data || {} });
    }

    async add(_, res, next) {
        try {
            const access = new this.Model(res.locals.body);
            const savedAccess = await access.save();
            res.json(savedAccess);
        } catch(e) {
            next(ApiError.unprocessable(e?.errors));
        }
    }

    async edit(req, res, next) {
        try {
            const data = await this.Model.findByIdAndUpdate(req.params.id, res.locals.body, { new: true });
            res.json(data);
        } catch(e) {
            next(ApiError.unprocessable(e?.errors));
        }
    }

    async delete(req, res, next) {
        try {
            const data = await this.Model.findByIdAndRemove(req.params.id);
            res.json(data || {});
        } catch(e) {
            next(ApiError.unprocessable(e?.errors));
        }
    }
}

module.exports = BasicCRUD;