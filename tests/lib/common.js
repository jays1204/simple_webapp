"use strict";

const Promise = require('bluebird');
const request = require("request-promise");
const host = "http://localhost";
const port = 7777;
const loginJar = request.jar();

function getUserSession() {
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

  return request(options)
    .then((body) => {
      let loginOptions = {
        uri: `${host}:${port}` + "/api/v1/auth/login",
        method: "POST",
        body: {
          user_id: "charlie123",
          password: "1q2w3r"
        },
        json: true,
        jar: loginJar
      };

      return request(loginOptions);
    })
  .then(result => {
    return Promise.resolve({jar: loginJar});
  })
  .catch((err) => {
    return Promise.reject(err);
  });
}

module.exports = {
  getUserSession: getUserSession,
  host: host,
  port: port
};
