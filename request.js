module.exports = (async (port) => {
    const express = require('express');
    const cors = require('cors');
    const morgan = require('morgan');

    const app = express();

    //Middleware
    app.use(cors());
    app.use(express.json());
    app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

    const { compileModels, loadDynamicRoutes } = require('./loader');
    compileModels();
    app.use('/api', await loadDynamicRoutes());

    //ErrorHandler
    app.use(require('./error/errorHandler'));
    app.use('', (req, res) => {
        res.status(404).json({
            message: 'Page not found',
            time: Date.now()
        });
    }); 

    await app.listen(port);
});