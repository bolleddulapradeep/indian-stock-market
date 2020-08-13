var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('./db/mongoose')
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var company_stocks = require('./routes/company')
var app = express();

var cors = require("cors");
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/index', indexRouter);
app.use('/app/v1/', usersRouter);
app.use('/app/v1/shares', company_stocks)

module.exports = app;
