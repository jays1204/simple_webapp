'use strict';

const express = require('express');
const router = express.Router();
const passport = require('../utils/passport');
const querystring = require('querystring');

const authService = require('../service/authService');

//login DONE
router.all('/login', passport.authenticate('local'), (req, res, next) => {
  let referrer = req.headers.referer;

  if (referrer) {
    return res.redirect(referrer);
  } else {
    return res.json();
  }
});

//logout  DONE
router.delete("/", (req, res, next) => {
  return res.redirect("/logout");
});

//logout  DONE
router.all('/logout', passport.authenticationMiddleware, (req, res, next) => {
  req.logout();
  req.session.destroy();
  let referrer = req.headers.referer;

  if (referrer) {
    return res.redirect(referrer);
  } else {
    return res.json();
  }
});

module.exports = router;
