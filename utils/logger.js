"use strict";

const winston = require("winston");
const level = (process.env.NODE_ENV === "production" ? "info" : "debug");

//console.log 사용
const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      level: level,
      timestamp: function () {
        return (new Date()).toISOString();
      }
    })
  ]
});

module.exports = logger
