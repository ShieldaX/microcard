/**
 * /user/*
 */

// 引入依赖
var passport = require('passport');
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');

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
  var user = new User({
      // 'local.username': req.body.username,
      'local.email': req.body.email,
      'local.password': req.body.password
    });

  user.save(function(err) {
    req.logIn(user, function(err) {
      res.redirect('/');
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

// 安全
exports.forgot = function (req, res, next) {
  res.render('user/forgot', {error: req.flash('error'), message: req.flash('info')});
};

exports.sendResetMail = function (req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ 'local.email': req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/user/forgot');
        }

        user.local.resetPasswordToken = token;
        user.local.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'shieldax@gmail.com',
          pass: 'yjbj0925HT@'
        }
      });

      var mailOptions = {
        to: user.email,
        from: 'HT labs <shieldax@gmail.com>',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/user/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      transporter.sendMail(mailOptions, function(err) {
        req.flash('info', '有一封邮件已经发送到 ' + user.email + ' ，请按照邮件中的提示操作');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/user/forgot');
  });
};

exports.resetPasswd = function (req, res, next) {
  User.findOne({ 'local.resetPasswordToken': req.params.token, 'local.resetPasswordExpires': { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', '重置链接无效或已经过期');
      return res.redirect('/user/forgot');
    }
    res.render('user/reset', {
      user: req.user
    });
  });
};

exports.doResetPasswd = function (req, res, next) {
  async.waterfall([
    function(done) {
      User.findOne({ 'local.resetPasswordToken': req.params.token, 'local.resetPasswordExpires': { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        // 更新安全数据
        user.local.password = req.body.password;
        user.local.resetPasswordToken = undefined;
        user.local.resetPasswordExpires = undefined;
        // 密码重置后登入用户
        user.save(function(err) {
          req.logIn(user, function(err) {
            done(err, user);
          });
        });
      });
    },
    function(user, done) {
      var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'shieldax@gmail.com',
          pass: 'yjbj0925HT@'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'HT labs <shieldax@gmail.com>',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      transporter.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        console.log('密码已重置');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/');
  });
};