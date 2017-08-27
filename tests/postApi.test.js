"use strict";

require('mocha');
let app = require("../app.js");
var models = require('../domain/entity');

const request = require("request-promise");
const should = require('should');
const commonLib = require('./lib/common.js');

const host = commonLib.host;
const port = commonLib.port;

let loginJar;
let server;
let myPostId;
let editTitle = 'this is my edited post.'
  , editContent = 'have you ever been tokyo?';

describe("user can", function() {
  before(function(done) {
    models.sequelize.sync({force: true})
      .then(function () {
        server = app.listen(port);

        return commonLib.getUserSession()
      })
      .then((result) => {
        loginJar = result.jar;
        request.jar = loginJar;
        return done();
      });
  });

  it('not regist post with non auth', function(done) {
    let options = {
      uri: `${host}:${port}` + "/api/v1/posts",
      method: "POST",
      body: {
        title: "this is my first post.",
        content: "have you ever been london?"
      },
      json: true,
      jar: null
    };

    request(options)
      .then(result => {
      })
      .catch(err => {
        should.exist(err);
        should(err.statusCode).be.equal(401);
        return done();
      });
  });

  it('regist post', function(done) {
    let options = {
      uri: `${host}:${port}` + "/api/v1/posts",
      method: "POST",
      body: {
        title: "this is my first post.",
        content: "have you ever been london?"
      },
      json: true,
      jar: loginJar
    };

    request(options)
      .then(body => {
        myPostId = body.id
        return done();
      })
      .catch(err => {
        should.not.exist(err);
      });
  });

  it('get latest pots', function(done) {
    let options = {
      uri: `${host}:${port}` + "/api/v1/posts",
      method: "GET",
      jar: loginJar
    };

    request(options)
      .then(result => {
        let data = JSON.parse(result);
        should(data.length).be.equal(1);
        return done();
      })
      .catch(err => {
        should.not.exist(err);
      });
  });

  it('modify post', function(done) {
    let options = {
      uri: `${host}:${port}` + "/api/v1/posts/" + myPostId,
      method: "PUT",
      body: {
        title: editTitle,
        content: editContent
      },
      json: true,
      jar: loginJar
    };

    request(options)
      .then(body => {
        should.exist(body);
    
        should(body.title).be.equal(editTitle);
        should(body.content).be.equal(editContent);
        return done();
      })
      .catch(err => {
        should.not.exist(err);
      });
  });

  it('get post', function(done) {
    let options = {
      uri: `${host}:${port}` + "/api/v1/posts/" + myPostId,
      method: "GET",
      json: true,
      jar: loginJar
    };

    request(options)
      .then(body => {
        should.exist(body);
    
        should(body.title).be.equal(editTitle);
        should(body.content).be.equal(editContent);
        return done();
      })
      .catch(err => {
        should.not.exist(err);
      });
  });

  it('delete post', function(done) {
    let options = {
      uri: `${host}:${port}` + "/api/v1/posts/" + myPostId,
      method: "DELETE",
      json: true,
      jar: loginJar
    };

    request(options)
      .then(body => {
        should.exist(body);
        return done();
      })
      .catch(err => {
        should.not.exist(err);
      });
  });

  after(function() {
    server.close();
  });

});
