const mongoose = require('mongoose');
const ApiError = require('../../error/ApiError');

class CRUD {
    constructor(moduleCode) {
        this.Model = mongoose.model(moduleCode);

        this.search = this.search.bind(this);
        this.locator = this.locator.bind(this);
        this.add = this.add.bind(this);
        this.edit = this.edit.bind(this);
        this.delete = this.delete.bind(this);
    }

    search() { throw ApiError.internal('Search method must be implemented'); }
    locator() { throw ApiError.internal('Locator method must be implemented'); }
    add() { throw ApiError.internal('Add method must be implemented'); }
    edit() { throw ApiError.internal('Update method must be implemented'); }
    delete() { throw ApiError.internal('Delete method must be implemented'); }
}

module.exports = CRUD;