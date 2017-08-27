'use strict';

const passport = require('passport')
  , Strategy = require('passport-local').Strategy;

const models = require('../domain/entity')
  , User = models.User;
const UserSession = require('../domain/dto/userSession');
const Status = require('../domain/constant/Status');

//로그인 설정
passport.use(new Strategy({usernameField:"user_id"}, (username, password, done) => {
  let findOption = {
    where : {userId: username}
  };

  return User.findOne(findOption)
    .then(user => {
      if (!user) {
        logger.info(`[passportLocalStrategy] not_exist_user_id - username:${username}`);
        return done(null, false, {message: 'Incorrect username.'});
      }

      if (User.encodePassword(password) != user.password) {
        logger.info(`[passportLocalStrategy] invalid_password - username:${username}`);
        return done(null, false, {message: 'Incorrect password.'});
      }

      //비활성화, 탈퇴 사용자는 로그인 불가
      if (user.status == Status.object.NON_ACTIVE) {
        logger.info(`[passportLocalStrategy] deactivte_user - username:${username}`);
        return done(null, false, {message: 'deactivated'});
      }

      return done(null, user);
    })
  .catch(err => {
    logger.error("[passportLocalStrategy]", err);
    return done(err);
  })
}));

//세션에 저장할 사용자 식별 정보
passport.serializeUser((user, cb) => {
  return cb(null, user.id)
});

//req.user에서 들고 다닐 정보
passport.deserializeUser((id, cb) => {
  return User.findById(id)
    .then(user => {
      let sessionInfo = null;

      if (user) {
        sessionInfo = new UserSession(user.id, user.userId, user.nickname);
        return cb(null, sessionInfo);
      } else { //세션에 저장된 정보가 DB에 존재하지 않을 경우
        logger.error(`[passport.deserializeUser] NOT_FOUND - user.id:${id}`);
        return cb(40001);
      }
    })
  .catch(err => {
    logger.error("[passport.deserializeUser]", err);
    return cb(err);
  });
});

//redirect on non authenticated request
passport.authenticationMiddleware = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  return res.redirect('/');
};

passport.isLogin = function(req, res, next) {
  let userSession = req.user;

  if (!userSession) {
    return next(40101);
  } else {
    return next();
  }
};

module.exports = passport;
