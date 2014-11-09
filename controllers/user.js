/**
 * /user/*
 */

// 引入依赖
var passport = require('passport');
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');


// 引入模型
var User = require('../models/user');

/**
 * Actions: 参照ROR的方式命名
 *
 */
// 注册
exports.new = function (req, res) {
  res.render('user/register', {error: req.flash('error')});
};

exports.create = function (req, res, next) {
  var user = new User({
      'local.email': req.body.email,
      'local.password': req.body.password
    });

  User.findOne({'local.email': user.local.email}, function (err, existingUser) {
    if (err) return next(err);
    if (existingUser) {   // 存在同名本地用户
      req.flash('error', '此用户已注册');
      return res.redirect('/user/signup');
    }

    user.save(function(err) {
      req.logIn(user, function(err) {
        if (err) return next(err);
        res.redirect('/');
      });
    });

  });
};

// 登录
exports.login = function (req, res) {
  res.render('user/login', {user: req.user, error: req.flash('error'), message: req.flash('info')});
};

exports.authenticate = function (req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) return next(err);
    if (!user) {
      req.flash('error', info.message);
      return res.redirect('/user/signin');
    }
    req.logIn(user, function(err) {
      if (err) return next(err);
      return res.redirect('/');
    });
  })(req, res, next);
};

// 注销
exports.logout = function (req, res) {
  req.logout();
  //res.redirect(req.headers.referer || '/');
  req.flash('info', '您已注销');
  res.redirect('/user/signin');
};