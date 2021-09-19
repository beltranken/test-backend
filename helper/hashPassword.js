const bcrypt = require('bcryptjs');

module.exports = function(password) {
    const salt = bcrypt.genSaltSync();
    return bcrypt.hashSync(password, salt);
};