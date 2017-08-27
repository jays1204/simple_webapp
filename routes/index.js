"use strict";

var express = require('express');
var router = express.Router();

const API_PREFIX = "/api/v1";
const users = require('./users.js');
const auths = require('./auths.js');
const posts = require('./posts.js');

router.use(`${API_PREFIX}/users`, users);
router.use(`${API_PREFIX}/auth`, auths);
router.use(`${API_PREFIX}/posts`, posts);

router.use(`${API_PREFIX}/\*`, (req, res, next) => {
  return res.status(404).json(); 
});

module.exports = router;
