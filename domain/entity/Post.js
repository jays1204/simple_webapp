'use strict';

const Status = require('../constant/Status');
const moment = require('moment');

const EXPIRE_DAY = 3;

module.exports = (sequelize, DataTypes) => {
    const Post = sequelize.define('Post', {
        title: { //글 제목
            type: DataTypes.STRING,
            allowNull: false,
            len: [1, 50] //최소 1글자, 최대 50글자
        },
        content: { //글 내용
            type: DataTypes.STRING,
            allowNull: false,
            len: [5, 200] //최소 5글자, 최대 200글자
        },
        status: { //글 상태
            type: Status.Enum,
            defaultValue: function() {
                return Status.object.ACTIVE;
            },
            allowNull: false,
        }
    }, {
        underscored: true,
        freezeTableName: true,
        paranoid: true,
        timestamps: true,
    });

    Post.findAllByLatestActive = (raw = false, transaction) => {
      let findOptions = {
        where: {
          status: Status.object.ACTIVE
        },
        order: [['id', 'desc']],
        limit : 20,
        raw: raw
      };

      if (transaction) {
        findOptions.transaction = transaction;
      }

      return Post.findAll(findOptions);
    };

    return Post;
};
