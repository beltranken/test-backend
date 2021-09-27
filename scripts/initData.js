(async function() {
    const bcrypt = require('bcryptjs');
    const { ModuleTypes, ModuleGroup } = require('../constant');

    const dotenv = require('dotenv');
    dotenv.config();

    require('../db').connect();
    const models = require('../loader/compileModels')();
    const option = {upsert: true, new: true};

    const rootCompany = await models.company.findOneAndUpdate({code: 'root'},{
        code: 'root',
        name: 'ROOT',
        isSuper: true,
        modules: [],
        users: []
    }, option);

    const salt = bcrypt.genSaltSync();
    const password = bcrypt.hashSync('root', salt);
    
    await models.user.updateOne({username: 'root', company: rootCompany._id}, {
        username: 'root',
        password: password,
        isSuper: true,
        company: rootCompany._id,
        email: 'beltrankenhenson@gmail.com'
    }, option);


    const modules = [];
    modules.push(models.module.updateOne({code: 'user'}, {
        code: 'user',
        name: 'User Management',
        type: ModuleTypes.Basic,
        group: ModuleGroup.Admin
    }, option));
    modules.push(models.module.updateOne({code: 'auth'}, {
        code: 'auth',
        name: 'Authentication Management',
        type: ModuleTypes.Custom,
        group: ModuleGroup.Admin
    }, option));
    modules.push(models.module.updateOne({code: 'module'}, {
        code: 'module',
        name: 'Module Management',
        type: ModuleTypes.Basic,
        group: ModuleGroup.Admin
    }, option));
    modules.push(models.module.updateOne({code: 'access'}, {
        code: 'access',
        name: 'Access Management',
        type: ModuleTypes.Basic,
        group: ModuleGroup.Admin
    }, option));
    
    await Promise.all(modules);
})()
    .then(_ => {
        process.exit(0);
    })
    .catch(e => {
        console.error(e);
        process.exit(1);
    });