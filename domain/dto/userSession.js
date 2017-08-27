'use strict';

const moment = require('moment');

//로그인에 사용될 사용자 세션 객체
class UserSession {
  constructor(id, username, nickname) {
    this.id = id;
    this.username = username;
    this.nickname = nickname;
  }
}

module.exports = UserSession;
