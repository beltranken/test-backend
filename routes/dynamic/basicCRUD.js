const express = require('express');
const { Action } = require('../../constant');
const BasicCRUD = require('../../controller/dynamic/BasicCRUD');
const { loadUser, loadModule, checkAccess, prepareQuery, validate, validateID } = require('../../middleware');

module.exports = (moduleCode) => {
    const router = express.Router();

    const basicCRUD = new BasicCRUD(moduleCode);

    const searchMiddleware  = [loadUser, loadModule(moduleCode), checkAccess(Action.View), prepareQuery];
    const locatorMiddleware = [loadUser, loadModule(moduleCode), checkAccess([Action.Edit, Action.View]), validateID]; 
    const addMiddleware     = [loadUser, loadModule(moduleCode), checkAccess(Action.Add), validate];
    const editMiddleware    = [loadUser, loadModule(moduleCode), checkAccess(Action.Edit), validate]; 
    const deleteMiddleware  = [loadUser, loadModule(moduleCode), checkAccess(Action.Delete), validateID];

    router.get('/',         searchMiddleware,   basicCRUD.search);
    router.get('/:id',      locatorMiddleware,  basicCRUD.locator);
    router.post('/',        addMiddleware ,     basicCRUD.add);
    router.patch('/:id',    editMiddleware,     basicCRUD.edit);
    router.delete('/:id',   deleteMiddleware,   basicCRUD.delete);

    return router;
};