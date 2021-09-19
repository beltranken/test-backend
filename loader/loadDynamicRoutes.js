const mongoose = require('mongoose');
const { Router } = require('express');
const customRoutes = require('../routes/custom');

const { dynamic: { basicCRUD } } = require('../routes');
const { ModuleTypes } = require('../constant');

module.exports = async () => {
    const Module = mongoose.model('module');

    if (!Module) throw new Error('Module was not properly loaded');

    const modules = await Module.find();
    const router = Router();
    
    for (let module of modules) {
        const { code, path, type } = module;
        const fullPath = '/' + (path || code);
        
        try {
            switch (type) {
            case ModuleTypes.Basic:
                router.use(fullPath, basicCRUD(code));
                break;
            }
        } catch(e) {
            if (process.env?.STRICT_MODE) throw e;
            if (!(e instanceof mongoose.Error.MissingSchemaError)) throw e;
        }
        

        if (customRoutes[code]) router.use(fullPath, customRoutes[code]);
    }
    return router;
};