var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var config = require('./config').config;
var compress = require('compression');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var multer = require('multer')


// 路由依赖
require('express-namespace')
var routes = require('./routes');

var MongoStore = require('connect-mongo')(session);

// 使用passport本地策略完成用户认证和授权
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var db = require('./models/db');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'public')));
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(multer({
  dest: './public/uploads/',
  limit: {
    fileSize: 2 * 1024 * 1024,
    files: 2
  }
}));

app.use(require('method-override')());
app.use(cookieParser(config.session_secret));
app.use(compress());
app.use(session({
  secret: config.session_secret,
  key: 'sid',
  store: new MongoStore({
    db: config.db_name
  }),
  resave: true,
  saveUninitialized: true,
}));
// Use connect-flash middleware.  This will add a `req.flash()` function to
// all requests, matching the functionality offered in Express 2.x.
app.use(flash());

// Use passport session
app.use(passport.initialize());
app.use(passport.session());



if (!config.debug) {
  app.use(csurf());
  app.set('view cache', true);
}

// requires the model with Passport-Local Mongoose plugged in
var User = require('./models/user');
passport.use(User.createStrategy());
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// routes
routes(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.set('port', process.env.PORT || config.port);

var server = app.listen(app.get('port'), function() {
  var address = server.address()
  console.log('Dililid server listening on port ' + address.port);
  console.log('Open ' + address.address + ':' + address.port + ' to access services.');
});

module.exports = app;
