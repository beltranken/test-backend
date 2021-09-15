const Access = require('../models/access');
const AccessValidator = require('../validators/access');
const basicRouter = require('../helper/basicRouter');

const router = basicRouter.setup('access', Access, AccessValidator);

module.exports = router;