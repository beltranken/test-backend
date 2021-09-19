
const rxObjectId = new RegExp('^[0-9a-fA-F]{24}$');

const ModuleTypes = {
    Basic: 'basic',
    Report: 'report'
};

const DynamicModule = {
    [ModuleTypes.Basic]: 'basicCRUD',
    [ModuleTypes.Report]: ''
};

const Action = {
    Edit: 'edit',
    View: 'view',
    Add: 'add',
    Delete: 'delete'
};

const ActionRank = {
    [Action.Edit]: 2,
    [Action.View]: 1,
    [Action.Add]: 2,
    [Action.Delete]: 2
};

module.exports = {
    rxObjectId,
    ModuleTypes,
    Action,
    ActionRank,
    DynamicModule
};