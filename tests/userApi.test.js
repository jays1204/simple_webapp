"use strict";

require('mocha');
let app = require("../app.js");
var models = require('../domain/entity');

const request = require("request-promise");
const should = require('should');

const commonLib = require('./lib/common.js');
const host = commonLib.host;
const port = commonLib.port;

const loginJar = request.jar();
let server;
let editNickname = "listShin";

describe("user can", function() {
  before(function(done) {
    models.sequelize.sync({force: true}).then(function () {
      server = app.listen(port);
      return done();
    });
  });

  it('join', function(done) {
    let options = {
      uri: `${host}:${port}` + "/api/v1/users",
      method: "POST",
      body: {
        user_id: "charlie123",
        nickname: "shindler",
        password: "1q2w3r"
      },
      json: true
    };

    request(options)
        .then((body) => {
          return done();
        })
        .catch((err) => {
          return done(err);
        });
  });

  it('not join - without password', function(done) {
    let options = {
      uri: `${host}:${port}` + "/api/v1/users",
      method: "POST",
      body: {
        user_id: "charliei",
        nickname: "shindlera"
      },
      json: true
    };

    request(options)
        .then((body) => {
          return done();
        })
        .catch((err) => {
          should(err.statusCode).be.equal(400);
          should(err.response.body.detail_code).be.equal(40002);
          return done();
        });
  });

  it('not join duplicated userId', function(done) {
    let options = {
      uri: `${host}:${port}` + "/api/v1/users",
      method: "POST",
      body: {
        user_id: "charlie",
        nickname: "shindler",
        password: "1q2w3r"
      },
      json: true
    };

    request(options)
        .then((body) => {
        })
        .catch((err) => {
          should(err.statusCode).be.equal(400);
          should(err.response.body.detail_code).be.equal(40005);
          return done();
        });
  });

  it('not join duplicated nickname', function(done) {
    let options = {
      uri: `${host}:${port}` + "/api/v1/users",
      method: "POST",
      body: {
        user_id: "charlie123",
        nickname: "shindler11",
        password: "1q2w3r"
      },
      json: true
    };

    request(options)
        .then((body) => {
        })
        .catch((err) => {
          should(err.statusCode).be.equal(400);
          should(err.response.body.detail_code).be.equal(40004);
          return done();
        });
  });

  it('login', function(done) {
    let options = {
      uri: `${host}:${port}` + "/api/v1/auth/login",
      method: "POST",
      body: {
        user_id: "charlie123",
        password: "1q2w3r"
      },
      json: true,
      jar: loginJar
    };

    request(options)
        .then((body) => {
          return done();
        })
        .catch((err) => {
          return done(err);
        });
  });

  it('not login with non member', function(done) {
    let options = {
      uri: `${host}:${port}` + "/api/v1/auth/login",
      method: "POST",
      body: {
        user_id: "tom",
        password: "amm"
      },
      json: true,
      jar: loginJar
    };

    request(options)
        .then((body) => {
        })
        .catch((err) => {
          should(err.statusCode).be.equal(401);
          return done();
        });
  });
  
  it('get my information', function(done) {
    let options = {
      uri: `${host}:${port}` + "/api/v1/users/me",
      method: "GET",
      jar: loginJar,
      json: true
    };

    request(options)
        .then((body) => {
          let user = body.user;
          should(user.userId).be.equal("charlie123");
          should(user.nickname).be.equal("shindler");
          return done();
        })
        .catch((err) => {
          return done(err);
        });
  });

  it('modify nickname', function(done) {
    let options = {
      uri: `${host}:${port}` + "/api/v1/users/me",
      method: "PUT",
      jar: loginJar,
      body: {
        nickname: editNickname
      },
      json: true
    };

    request(options)
        .then((body) => {
          should.exist(body);
          should(body.nickname).be.equal(editNickname);
          return done();
        })
        .catch((err) => {
          return done(err);
        });
  });

  it('modify email', function(done) {
    let editEmail = 'charile@gmail.com';
    let options = {
      uri: `${host}:${port}` + "/api/v1/users/me",
      method: "PUT",
      jar: loginJar,
      body: {
        email: editEmail
      },
      json: true
    };

    request(options)
        .then((body) => {
          should.exist(body);
          should(body.nickname).be.equal(editNickname);
          should(body.email).be.equal(editEmail);
          return done();
        })
        .catch((err) => {
          return done(err);
        });
  });

  it('modify password', function(done) {
    let options = {
      uri: `${host}:${port}` + "/api/v1/users/me/password",
      method: "PUT",
      jar: loginJar,
      body: {
        password: "pythonisgood"
      },
      json: true
    };

    request(options)
        .then((body) => {
          return done();
        })
        .catch((err) => {
          return done(err);
        });
  });
  
  it('logout', function(done) {
    let options = {
      uri: `${host}:${port}` + "/api/v1/auth/logout",
      method: "POST",
      json: true,
      jar: loginJar
    };

    request(options)
        .then((body) => {
          return done();
        })
        .catch((err) => {
          return done(err);
        });
  });

  it('deregister', function(done) {
    let loginOptions = {
      uri: `${host}:${port}` + "/api/v1/auth/login",
      method: "POST",
      body: {
        user_id: "charlie123",
        password: "pythonisgood"
      },
      json: true,
      jar: loginJar
    };
    let options = {
      uri: `${host}:${port}` + "/api/v1/users/me",
      method: "DELETE",
      jar: loginJar
    };

    request(loginOptions) 
      .then(body => {
        return request(options)
      })
        .then((body) => {
          return done();
        })
        .catch((err) => {
          return done(err);
        });
  });

  after(function() {
    server.close();
  });

});
