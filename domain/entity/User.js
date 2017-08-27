'use strict';

const crypto = require('crypto');

const Status = require('../constant/Status');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    userId: { //사용자Id
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'user_id'
    },
    nickname: { //사용자 닉네임
      type: DataTypes.STRING, 
      allowNull: false,
      unique: true
    },
    password: { //비밀번호
      type: DataTypes.STRING,
      allowNull: false
    },
    email: { // email
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    status: { //상태 값
      type: Status.Enum,
      defaultValue: function() {
        return Status.object.ACTIVE;
      },
      allowNull: false
    }
  }, {
    underscored: true, //자동 생성되는 칼럼 이름에 대한 underscored 스타일 적용
    freezeTableName: true, // 테이블 이름 변경 못하도록 설정
    paranoid: true, //delete 호출시에 실제로 지우지 않고 deleted_at에 표시
    timestamps: true, //updatedAt 과 같은 시간 칼럼 자동 생성
  });

  User.encodePassword = (password) => {
    let hash = crypto.createHash('sha256');
    hash.update(password);
    return hash.digest('hex');
  };

  User.findByUserId = (userId, raw = false, transaction) => {
    let findOption = {
      where: {
        userId: userId
      },
      raw: raw
    };

    if (transaction) {
      findOption.transaction = transaction;
    }

    return User.findOne(findOption);
  };

  User.findByNickname = (nickname, raw=false, transaction) => {
    let findOption = {
      where: {
        nickname: nickname
      },
      raw: raw
    };

    if (transaction) {
      findOption.transaction = transaction;
    }

    return User.findOne(findOption);
  };

  return User;
};

