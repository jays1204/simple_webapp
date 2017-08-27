"use strict";

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var requestLogger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

const logger = require("./utils/logger.js");
global.logger = logger;

const env = process.env.NODE_ENV || 'development';
const appConfig = require(`./config/app_config.json`)[env];
if (appConfig.use_env_variable) {
    global.config = process.env[appConfig.use_env_variable];
} else {
    global.config = appConfig;
}

const session = require('express-session');
const passport = require('./utils/passport');
const errorHandler = require('./utils/errorHandler.js');

var app = express();
var apiRouterIndex = require('./routes/index');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
//engine html
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(requestLogger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: 'dfasfsda', resave: false, saveUninitialized: false, cookie: {
  secure: false,
  maxAge: 1000 * 60 * 60 * 24 //24 hours
}}));


//configure user login
app.use(passport.initialize());
app.use(passport.session());

app.use(apiRouterIndex);
app.use(require('./routes/pages.js'));

app.use('/', express.static(__dirname + '/../public')); //static


//disable favicon
app.get('/favicon.ico', (req, res) => {
  return res.status(204);
});

// catch 404 
app.use(function(req, res, next) {
  logger.info(`[404] path: ${req.path}`);
  return res.status(404).end();
});

// error handler
app.use(errorHandler);

process.on('uncaughtException', (err) => {
  logger.error("[uncaughtException]", err);
});

module.exports = app;
