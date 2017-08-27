var express = require('express');
var router = express.Router();

const Status = require('../domain/constant/Status');
const passport = require('../utils/passport');
const userService = require('../service/userService');
const authService = require('../service/authService');

// 사용자 목록 조회
router.get('', passport.isLogin, function(req, res, next) {
  let user = req.user;

  userService.getAllUsers()
    .then(list => {
      return res.json(list);
    })
  .catch(err => {
    logger.error(`[${req.path}]`, err);
    return next(50001);
  });
});

//회원 가입 
router.post('', (req, res, next) => {
  let referrer = req.headers.referer;
  let body = req.body;

  let userId = body.user_id;
  let password = body.password;
  let nickname = body.nickname;
  let email = body.email;

  if (req.isAuthenticated()) {
    return next(40001);
  }

  if (!userId || !password || !nickname) {
    logger.info(`[${req.path}] invalid_body: ${body}`);
    return next(40002);
  }

  return userService.registerNewUser(userId, password, nickname, email)
    .then(result => {
      if (referrer) {
        return res.redirect(referrer);
      } else {
        return res.json({});
      }
    })
    .catch(err => {
      logger.error(`[${req.path}]`, err);
      return next(err);
    });
});

//내 정보 가져오기
router.get("/me", passport.isLogin, (req, res, next) => {
  let userSession = req.user;

  userService.getMyInfo(userSession)
    .then(userData => {
      return res.json({user: userData});
    })
  .catch(err => {
    logger.error(`[${req.path}] error`, err);
    return next(err);
  });
});


//탈퇴, 비활성 처리
router.delete("/me", passport.isLogin, (req, res, next) => {
  let userSession = req.user;

  return userService.deactivateUser(userSession)
    .then(result => {
      //logout
      req.logout();
      req.session.destroy();

      return res.json();
    })
  .catch(err => {
    return next(err);
  })
});

//내 정보 수정하기(현재는 nickname, email 수정만 지원) 
router.put("/me", passport.isLogin, (req, res, next) => {
  let userSession = req.user;
  let newNickname = req.body.nickname;
  let email = req.body.email;

  if (!newNickname && !email) {
    logger.info(`[${req.path}] empty data`); 
    return next(40003);
  }

  return userService.editUserInfo(userSession, {newNickname: newNickname, newEmail: email})
    .then(editedUser => {
      req.user.nickanme = editedUser.nickname;
      return res.json(editedUser);
    })
  .catch(err => {
    logger.error(`[${req.path}]`, err);
    return next(50001);
  });
});

// 비밀번호 변경하기 
router.put("/me/password", passport.isLogin, (req, res, next) => {
  let userSession = req.user;
  let newPassword = req.body.password;

  if (!newPassword) {
    logger.info(`[${req.path}] empty password`); 
    return next(40003);
  }

  return authService.modifyPassword(userSession, newPassword)
    .then(result => {
      return res.end();
    })
  .catch(err => {
    logger.error(`[${req.path}]`, err);
    return next(50001);
  });
});

//회원 id로 정보 가져오기
router.get("/:user_id", passport.isLogin, (req, res, next) => {
  let givenUserId = req.params.user_id;
  let userSession = req.user;

  userService.getUserInfo(givenUserId)
    .then(userData => {
      return res.json({user: userData});
    })
  .catch(err => {
    logger.error(`[${req.path}] error`, err);
    return next(err);
  });
});

//회원 id로 정보 수정하기
router.put("/:user_id", passport.isLogin, (req, res, next) => {
  let pathUserId = req.params.user_id;
  let userSession = req.user;

  if (userSession.username != userId) {
    logger.info(`[${req.path}] can_not_edit_other_user - requester:${userService}`);
    return next(4010);
  }

  return userService.editUserInfo(userSession, {newNickname: newNickname})
    .then(editedUser => {
      req.user.nickanme = editedUser.nickname;
      return res.end();
    })
  .catch(err => {
    logger.error(`[${req.path}]`, err);
    return next(50001);
  });
});

//회원 id로 탈퇴시키기
router.delete("/:user_id", passport.isLogin, (req, res, next) => {
  let pathUserId = req.params.user_id;
  let userSession = req.user;

  if (userSession.username != userId) {
    logger.info(`[${req.path}] can_not_delete_other_user - requester:${userService}`);
    return next(4010);
  }

  return userService.deactivateUser(userSession)
    .then(result => {
      req.logout();
      req.session.destroy();

      return res.json();
    })
  .catch(err => {
    return next(err);
  })
});


module.exports = router;
