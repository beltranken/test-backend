const Module = require('../models/module');
const ModuleValidator = require('../validators/module');
const basicRouter = require('../helper/basicRouter');

const router = basicRouter.setup('module', Module, ModuleValidator);

module.exports = router;