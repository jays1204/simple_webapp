"use strict";

var express = require('express');
var router = express.Router();

const postService = require('../service/postService.js');

/* GET test page. */
router.get('/test', (req, res, next) => {
  let userSession;

  if (req.isAuthenticated()) {
    userSession = req.user;
  }

  postService.getLatestPosts()
    .then(list => {
      return res.render('test', { title: 'test page', user: userSession, list: list});
    })
  .catch(err => {
    return res.end();
  });
});

module.exports = router;
