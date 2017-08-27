'use strict';

const models = require('../domain/entity')
, sequelize = models.sequelize
, User = models.User;
const Config = global.config;

const Promise = require('bluebird');

//비밀 번호 수정
function modifyPassword(userSession, password) {
  return User.findByUserId(userSession.username)
    .then(user => {
      if (!user) {
        logger.info(`[modifyPassword] empty user - userId:${userSession.username}`);
        return Promise.reject(40100);
      }

      user.password = User.encodePassword(password);
      return user.save();
    })
  .catch(err => {
    logger.error(`[modifyPassword]`, err);
    return Promise.reject(err);
  });
}



module.exports = {
  modifyPassword: modifyPassword
};
