(async function() {
    const bcrypt = require('bcryptjs');
    const { ModuleTypes, ModuleGroup } = require('../constant');

    const dotenv = require('dotenv');
    dotenv.config();

    require('../db').connect();
    const models = require('../loader/compileModels')();

    const rootCompany = new models.company({
        code: 'root',
        name: 'ROOT',
        isSuper: true,
        modules: [],
        users: []
    });

    const salt = bcrypt.genSaltSync();
    const password = bcrypt.hashSync('root', salt);
    const rootCompanyId = (await rootCompany.save())._id;
    const rootUser = new models.user({
        username: 'root',
        password: password,
        isSuper: true,
        company: rootCompanyId,
        email: 'beltrankenhenson@gmail.com'
    });
    await rootUser.save();

    const modules = [];
    modules.push(new models.module({
        code: 'user',
        name: 'User Management',
        type: ModuleTypes.Basic,
        group: ModuleGroup.Admin
    }));
    modules.push(new models.module({
        code: 'auth',
        name: 'Authentication Management',
        type: ModuleTypes.Custom,
        group: ModuleGroup.Admin
    }));
    modules.push(new models.module({
        code: 'module',
        name: 'Module Management',
        type: ModuleTypes.Basic,
        group: ModuleGroup.Admin
    }));
    modules.push(new models.module({
        code: 'access',
        name: 'Access Management',
        type: ModuleTypes.Basic,
        group: ModuleGroup.Admin
    }));

    const promises = [];
    for(let module of modules) {
        promises.push(module.save());
    }
    await Promise.all(promises);
})()
    .then(_ => {
        process.exit(0);
    })
    .catch(e => {
        console.log(e);
        process.exit(1);
    });