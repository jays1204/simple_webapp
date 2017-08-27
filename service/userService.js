"use strict";

const models = require('../domain/entity')
, sequelize = models.sequelize
, User = models.User
, UserPart = models.UserPart;
const Config = global.config;

const Promise = require('bluebird');
const Status = require('../domain/constant/Status');

//신규 사용자 등록을 위한 조건 검사 및 등록
function registerNewUser(userId, password, nickname, email = null) {
  if (!userId.match(/^[a-z0-9]+$/i) || userId.toLowerCase() === "me") {
    logger.info(`[registerNewUser] invalid_user_id_foramt: ${userId}`);
    return Promise.reject(40002);
  }

  return isUniqueUserId(userId)
    .then(uniqStatus => {
      if (uniqStatus) {
        if (uniqStatus == Status.object.ACTIVE) {
          return Promise.reject(40004);
        } else {
          return Promise.reject(40008);
        }
      } else {
        return isUniqueNickname(nickname);
      }
    })
  .then(uniqStatus => {
    if (uniqStatus) {
      if (uniqStatus == Status.object.ACTIVE) {
        return Promise.reject(40005);
      } else {
        return Promise.reject(40009);
      }
    } else {
      return createNewUser(userId, password, nickname, email)
    }
  })
  .then(result => {
    logger.info("[registerNewUser]", result);
    return Promise.resolve({});
  })
  .catch(err => {
    logger.error("[registerNewUser]", err);
    return Promise.reject(err);
  });
}

//회원 생성
function createNewUser(userId, password, nickname, email = null) {
  let properties = {
    userId: userId,
    password: User.encodePassword(password),
    nickname: nickname
  }
  , newUser;

  if (email) {
    properties.email = email;
  }

  return sequelize.transaction(t => {
    newUser = User.build(properties, {transaction: t});
    return newUser.save({transaction: t});
  })
  .then(savedUser => {
    return Promise.resolve(savedUser);
  })
  .catch(err => {
    logger.error("[createNewUser]", err);
    return Promise.reject(err);
  });
}

//session의 회원 정보 가져오기
function getMyInfo(userSession) {
  if (!userSession) {
    logger.info("[getMyInfo] userSession data is empty");
    return Promise.resolve({});
  }

  return getUserInfo(userSession.username);
}

// 주어진 사용자 정보 가져오기
function getUserInfo(userId) {
  return User.findByUserId(userId, true)  
    .then(userData => {
      delete userData.password;
      return Promise.resolve(userData);
    })
  .catch(err => {
    logger.error("[getUserInfo]", err);
    return Promise.reject(err);
  });
}

//  가장 최근에 가입한 사용자 최대 20명의 목목을 가져온다.
function getAllActiveUsers(count = 20) {
  let activeUserCondition = {
    where: {
      status: {$ne: Status.object.NON_ACTIVE}
    }, 
    order: [["created_at", "DESC"]],
    limit: count > 20 ? 20 : count,
    raw: true
  };

  return User.findAll(activeUserCondition)
    .then(list => {
      let userList = list.map(u => {
        delete u.password;
        return u;
      });
      return Promise.resolve(userList ? userList : []);
    })
  .catch(err => {
    logger.error("[getAllActiveUsers]", err);
    return Promise.reject(err);
  });
}

// 사용자 정보 수정
function editUserInfo(userSession, newInfo) {
  let user;

  return sequelize.transaction(t => {
    return User.findByUserId(userSession.username, false, t)
      .then(findUser => {
        user = findUser;

        if (newInfo.newNickname) {
          return isUniqueNickname(newInfo.newNickname)
        } else {
          return null;
        }
      })
    .then(uniqStatus => {
      if (uniqStatus) {
        logger.info(`[editUserInfo] exist_nickname - nickanme:${newInfo.newNickname}`);
        return Promise.reject(40005);
      } else {
        if (newInfo.newNickname) {
          user.nickname = newInfo.newNickname;
        }
        if (newInfo.newEmail) {
          user.email = newInfo.newEmail;
        }

        return user.save({transaction: t});
      }
    });
  })
  .then(result => {
    let data = result.get({plain:true});
    return Promise.resolve(data);
  })
  .catch(err => {
    logger.error('[editUserInfo]', err);
    return Promise.reject(err);
  });
}

//사용자 탈퇴(비활성화처리)
function deactivateUser(userSession) {
  return User.findByUserId(userSession.username)  
    .then(user => {
      user.status = Status.object.NON_ACTIVE;
      user.save();

      logger.info(`[deactivateUser] deactive - user:${user}`);
      return Promise.resolve();
    })
  .catch(err => {
    logger.error("[deactivateUser]", err);
    return Promise.reject(err);
  });
}

//userId가 유니크한지 검사
function isUniqueUserId(userId) {
  return User.findByUserId(userId)
    .then(user => {
      if (user) {
        return Promise.resolve(user.status);
      }

      return Promise.resolve(null);
    })
  .catch(err => {
    log.error(`[isUniqueUserId]`, err);
    return Promise.reject(err);
  });
}

//nickname이 유니크한지 검사
function isUniqueNickname(nickname) {
  return User.findByNickname(nickname)
    .then(user => {
      if (user) {
        return Promise.resolve(user.status);
      }

      return Promise.resolve(null);
    })
  .catch(err => {
    log.error(`[isUniqueNickname]`, err);
    return Promise.reject(err);
  });
}

module.exports = {
  createNewUser: createNewUser,
  getAllUsers: getAllActiveUsers,
  editUserInfo: editUserInfo,
  isUniqueNickname: isUniqueNickname,
  isUniqueUserId: isUniqueUserId,
  deactivateUser: deactivateUser,
  getMyInfo: getMyInfo,
  getUserInfo: getUserInfo,
  registerNewUser: registerNewUser
};
