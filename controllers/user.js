/**
 * /user/*
 */

// 引入依赖
var passport = require('passport');

// 引入模型
var User = require('../models/user');

var signinRedirct = '/';

/**
 * Actions: 参照ROR的方式命名
 *
 */
// 注册
exports.new = function (req, res) {
  res.render('user/register', {});
};

exports.create = function (req, res) {
  User.register(
    new User({email: req.body.email}),
    req.body.password,
    function (err, user) {
      if (err) {
        req.flash('error', err.message);
        return res.render('user/register', {error: req.flash('error')});
      }
      passport.authenticate('local')(req, res, function () {
        req.flash('info', '注册成功');
        res.redirect(signinRedirct);
      });
    }
  );
};

// 登录
exports.login = function (req, res) {
  res.render('user/login', {user: req.user, error: req.flash('error'), message: req.flash('info')});
};

exports.authenticate = function (req, res, next) {
  var authOptions = {
    successRedirect: signinRedirct,
    successFlash: '登录成功',
    failureRedirect: '/user/signin',
    failureFlash: '用户名密码不匹配'
  };
  req.session.cookie.maxAge = 2592000000; // 30*24*60*60*1000 Rememeber 'me' for 30 days
  passport.authenticate('local', authOptions)(req, res, next);
};

// 注销
exports.logout = function (req, res) {
  req.logout();
  //res.redirect(req.headers.referer || '/');
  req.flash('info', '您已注销');
  res.redirect('/user/signin');
};