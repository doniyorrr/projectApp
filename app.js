const createError = require('http-errors');
const express = require('express');
const mongoose = require("mongoose");
const chalk = require("chalk");
const path = require("path");
const port = 3000;
const passport = require("passport");
const r_Index = require("./routers/index");
const r_Add = require("./routers/add");
const r_User = require("./routers/user");
const ExpressValidator = require("express-validator");
const session = require("express-session");
const cookieParser = require('cookie-parser');
const logger = require('morgan');



const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');



app.use(require("connect-flash")());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
  })
);

//========================================================= express-VAlidator
app.use(
  ExpressValidator({
    errorFormatter: (param, msg, value) => {
      let namespace = param.split(".");
      root = namespace.shift();
      formParam = root;

      while (namespace.length) {
        formParam += "[" + namespace.shift() + "]";
      }
      return {
        param: formParam,
        msg: msg,
        value: value,
      };
    },
  })
);



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use("/uploads" , express.static(path.join(__dirname, "uploads")));

//============================================= mongoose settings

const database = require('./helper/db');
mongoose.connect(database.db);

const db = mongoose.connection;
db.on("open", () => {
  console.log("MongoDB running");
});
db.on("error", (err) => {
  console.log("MongoDB ERROR running", err);
});

// app.use(express.static(path.join(__dirname, "/public")));
// app.use(express.static(path.join(__dirname)));

//=================================================== router settings

require("./passport/passport")(passport);
app.use(passport.initialize());
app.use(passport.session());
app.get("*", (req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

app.use(r_Index);
app.use(r_Add);
app.use(r_User);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
