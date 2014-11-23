/**
 * /user/*
 */

// 引入依赖
var passport = require('passport');
var async = require('async');
var crypto = require('crypto');
var config = require('../config').config;
var api_key = config.mailgun.api_key;
var domain = config.mailgun.domain;
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});

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

// 第三方登录
exports.weiboCancel = function (req, res, next) {
  var params = req.params;
  var weiboId = params.uid;
  console.log(params);
  // TODO: 验证appkey
  User.findOne({'weibo.id': weiboId}, function (err, user) {
    if (err) return next(err);
    // 存在此用户, 删除
    if (user) {
      console.log('发现微博用户', weiboId);
      user.weibo.id = undefined;
      user.weibo.token = undefined;
      user.weibo.name = undefined;
      user.save(function (err) {
        if (err) return next(err);
        res.redirect('/user/auth');
      });
    } else {
      console.log('未发现存在此微博用户');
      res.redirect('/user/auth');
    }
  });
};

// 安全
exports.forgot = function (req, res, next) {
  res.render('user/forgot', {error: req.flash('error'), message: req.flash('info')});
};

// 发送重置邮件
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
          req.flash('error', '无效的账号！');
          return res.redirect('/user/forgot');
        }

        user.local.resetPasswordToken = token;
        user.local.resetPasswordExpires = Date.now() + 3600000 * 2; // 2 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {

      var mailOptions = {
        to: user.email,
        from: 'HT Labs <postmaster@noreply.dililid.com>',
        subject: '重置密码',
        text: '你好，\n\n' +
          '应阁下申请重置密码的请求发送此邮件。请点击以下链接设置新密码：\n\n' +
          'http://' + config.site_domain + '/user/reset/' + token + '\n\n' +
          '(如果无法点击该URL链接地址，请将它复制并粘帖到浏览器的地址输入框，然后单击回车即可。)\n\n注意:请您在收到邮件2小时内使用，否则该链接将会失效。\n\n系统发信，请勿回复'
      };

      mailgun.messages().send(mailOptions, function (err, body) {
        req.flash('info', '重置密码链接已经发送到 ' + user.email + ' ，请及时登录到您的邮箱重置您的密码！');
        console.log(body);
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
      req.flash('error', '重置链接无效或已经过期！');
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
          req.flash('error', '重置链接无效或已经过期！');
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
      var mailOptions = {
        to: user.email,
        from: 'HT Labs <postmaster@noreply.dililid.com>',
        subject: '您的密码已重置',
        text: '您好，\n\n' +
          '阁下的所用账户的密码已成功重置，特此通知。\n\n系统发信，请勿回复'
      };
      mailgun.messages().send(mailOptions, function (err, body) {
        console.log('密码已重置');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/');
  });
};