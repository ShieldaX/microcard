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

// 使用passport完成用户认证和授权
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GitHubStrategy = require('passport-github').Strategy;
var WeiboStrategy = require('passport-weibo').Strategy;

var db = require('./models/db');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.png'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(multer({
  dest: './public/uploads/',
  limit: {
    fileSize: 1 * 1024 * 1024,
    files: 1
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
// passport.use(User.createStrategy());

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(email, password, done) {
    User.findOne({ 'local.email': email }, function(err, user) {
      if (err) return done(err);
      if (!user) return done(null, false, { message: '账户和密码不匹配' });
      user.comparePassword(password, function(err, isMatch) {
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: '账户和密码不匹配' });
        }
      });
    });
  }
));

var WEIBO_CLIENT_ID = '43664777';
var WEIBO_CLIENT_SECRET = '80cbe41c3e9db32f806e3a603a3c9ee1';
var WEIBO_CLIENT_CALLBACK = 'http://127.0.0.1:8080/user/auth/weibo/callback';
passport.use(new WeiboStrategy({
    clientID: WEIBO_CLIENT_ID,
    clientSecret: WEIBO_CLIENT_SECRET,
    callbackURL: WEIBO_CLIENT_CALLBACK,
    passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
  },
  function(req, accessToken, refreshToken, profile, done) {
    // asynchronous
    process.nextTick(function() {
      console.log(profile);
      if (!req.user) {
        // Not logged-in. Authenticate based on weibo account.
        User.findOne({'weibo.id': profile.id}, function (err, user) {
          // 如果发生了错误，直接返回出错信息
          if (err) return done(err);

          // 找到了已使用weibo登录的用户，更新其第三方登录信息
          if (user) {
            // console.log('更新用户');
            user.weibo.token = accessToken;
            // user.weibo.email = profile.emails[0].value;
            user.weibo.name = profile._raw.name;
            user.save(function (err) {
              if (err) throw err;
              return done(null, user);
            });
          } else {
            // console.log('创建新用户');
            var newUser = new User({
              weibo: {
                id: profile.id,
                token: accessToken,
                // email: profile.emails[0].value,
                name: profile.username
              }
            });
            newUser.save(function (err) {
              if (err) throw err;
              return done(null, newUser);
            });
          }

        });
      } else {
        // Logged in. Associate Weibo account with user.  Preserve the login
        // state by supplying the existing user after association.
        // 绑定当前用户
        var user = req.user;
        user.weibo.id = profile.id;
        user.weibo.token = accessToken;
        // user.weibo.email = profile.emails[0].value;
        user.weibo.name = profile._raw.name;
        user.save(function (err) {
          if (err) throw err;
          return done(null, user);
        });
      }
    });

  }
));

/*
passport.use(new GitHubStrategy({
    clientID: config.oauth.github.client_id,
    clientSecret: config.oauth.github.client_secret,
    callbackURL: config.oauth.github.callback,
    passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
  },
  function(req, accessToken, refreshToken, profile, done) {
    // asynchronous
    process.nextTick(function() {
      if (!req.user) {
        // Not logged-in. Authenticate based on GitHub account.
        User.findOne({'github.id': profile.id}, function (err, user) {
          // 如果发生了错误，直接返回出错信息
          if (err) return done(err);

          // 找到了已使用GitHub登录的用户，更新其第三方登录信息
          if (user) {
            // console.log('更新用户');
            user.github.token = accessToken;
            user.github.email = profile.emails[0].value;
            user.github.name = profile.username;
            user.save(function (err) {
              if (err) throw err;
              return done(null, user);
            });
          } else {
            // console.log('创建新用户');
            var newUser = new User({
              github: {
                id: profile.id,
                token: accessToken,
                email: profile.emails[0].value,
                name: profile.username
              }
            });
            newUser.save(function (err) {
              if (err) throw err;
              return done(null, newUser);
            });
          }

        });
      } else {
        // Logged in. Associate GitHub account with user.  Preserve the login
        // state by supplying the existing user after association.
        // 绑定当前用户
        var user = req.user;
        user.github.id = profile.id;
        user.github.token = accessToken;
        user.github.email = profile.emails[0].value;
        user.github.name = profile.username;
        user.save(function (err) {
          if (err) throw err;
          return done(null, user);
        });
      }
    });

  }
));
*/
// use static serialize and deserialize of model for passport session support
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

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
