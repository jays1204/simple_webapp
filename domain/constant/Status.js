'use strict';

const Sequelize = require('sequelize');
const _ = require('lodash');

const Status = {
    ACTIVE: 'ACTIVE', //활성
    NON_ACTIVE: 'NON_ACTIVE', //비활성
    HIDDEN: 'HIDDEN' //숨김
};

const StatusEnum = Sequelize.DataTypes.ENUM(_.keys(Status));

module.exports = {
    object: Status,
    Enum: StatusEnum
};
