const Company = require('../models/company');
const CompanyValidator = require('../validators/company');
const basicRouter = require('../helper/basicRouter');

const router = basicRouter.setup('access', Company, CompanyValidator);

module.exports = router;