const mongoose = require('mongoose');

function connect() {
    return mongoose.connect(process.env.DB_CONNECTION);
}

function close() {
    return mongoose.close();
}

module.exports = {
    connect,
    close
};