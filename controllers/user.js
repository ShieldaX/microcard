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

exports.create = function (req, res, next) {
  var user = new User({
      'local.email': req.body.email,
      'local.password': req.body.password
    });

  User.findOne({'local.email': user.local.email}, function (err, existingUser) {
    if (err) return next(err);
    if (existingUser) {   // 存在同名本地用户
      req.flash('error', '此用户已注册');
      return res.redirect('back');
    }

    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        user.local.activeToken = token;
        user.local.activeExpires = Date.now() + 3600000 * 24; // 24 hour

        user.save(function(err) {
          done(err, token, user);
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
          from: 'HT Labs <shieldax@gmail.com>',
          subject: '注册激活邮件',
          text: '你好！\n\n' +
            '感谢阁下注册使用我们的服务，请点击以下链接完成注册：\n\n' +
            'http://' + req.headers.host + '/user/active/' + token + '\n\n' +
            '(如果无法点击该URL链接地址，请将它复制并粘帖到浏览器的地址输入框，然后单击回车即可。)注意:请您在收到邮件24小时内使用，否则该链接将会失效。\n\n' +
            '系统发信，请勿回复'
        };
        transporter.sendMail(mailOptions, function(err) {
          done(err, 'done');
        });
      }
    ], function(err) {
      if (err) return next(err);
      req.logIn(user, function(err) {
        res.redirect('/user/confirm');
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

// 激活
exports.confirm = function (req, res) {
  if (req.user && req.isAuthenticated() && req.user.isActive) {
    return res.redirect('/');
  }
  res.render('user/active', {title: '账户未激活', error: req.flash('error'), message: req.flash('info')});
};

exports.active = function (req, res, next) {
  if (req.user && req.isAuthenticated() && req.user.isActive) {
    return res.redirect('/');
  }
  User.findOne({ 'local.activeToken': req.params.token, 'local.activeExpires': { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', '激活链接无效或已经过期！');
      return res.redirect('/user/confirm');
    }
    user.local.activeToken = undefined;
    user.local.activeExpires = undefined;
    user.save(function(err) {
      if (!req.user) {
        req.logIn(user, function(err) {
          res.render('user/active', {active: true, user: req.user});
        });
      } else {
        res.render('user/active', {active: true});
      }
    });
  });
};

// 发送激活邮件
exports.sendActiveMail = function (req, res, next) {
  var user = req.user;
  if (user.isActive) { // 用户已激活，避免重复激活
    res.redirect('/');
  } else {
    // var expires = user.activeExpires;
    // TODO: 检查发送频率

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
            req.flash('error', '阁下尝试激活的账号无效！');
            return res.redirect('/user/confirm');
          }

          user.local.activeToken = token;
          user.local.activeExpires = Date.now() + 3600000 * 2; // 2 hour

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
          from: 'HT Labs <shieldax@gmail.com>',
          subject: '注册激活邮件',
          text: '你好！\n\n' +
            '感谢阁下注册使用我们的服务，请点击以下链接完成注册：\n\n' +
            'http://' + req.headers.host + '/user/active/' + token + '\n\n' +
            '(如果无法点击该URL链接地址，请将它复制并粘帖到浏览器的地址输入框，然后单击回车即可。)\n\n注意:请您在收到邮件2小时内使用，否则该链接将会失效。\n\n' +
            '系统发信，请勿回复'
        };
        transporter.sendMail(mailOptions, function(err) {
          req.flash('info', '账户激活邮件已发送，请及时登录到您的邮箱完成激活！');
          done(err, 'done');
        });
      }
    ], function(err) {
      if (err) return next(err);
      res.redirect('/user/confirm');
    });

  }
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
          req.flash('error', '无效的账号！');
          return res.redirect('/user/forgot');
        }

        user.local.resetPasswordToken = token;
        user.local.resetPasswordExpires = Date.now() + 3600000 * 2; // 1 hour

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
        from: 'HT Labs <shieldax@gmail.com>',
        subject: '重置密码',
        text: '你好，\n\n' +
          '应阁下申请重置密码的请求发送此邮件。请点击以下链接设置新密码：\n\n' +
          'http://' + req.headers.host + '/user/reset/' + token + '\n\n' +
          '(如果无法点击该URL链接地址，请将它复制并粘帖到浏览器的地址输入框，然后单击回车即可。)\n\n注意:请您在收到邮件2小时内使用，否则该链接将会失效。\n\n系统发信，请勿回复'
      };
      transporter.sendMail(mailOptions, function(err) {
        req.flash('info', '重置密码链接已经发送到 ' + user.email + ' ，请及时登录到您的邮箱重置您的密码！');
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
      var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'shieldax@gmail.com',
          pass: 'yjbj0925HT@'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'HT Labs <shieldax@gmail.com>',
        subject: '您的密码已重置',
        text: '您好，\n\n' +
          '阁下的所用账户的密码已成功重置，特此通知。\n\n系统发信，请勿回复'
      };
      transporter.sendMail(mailOptions, function(err) {
        // req.flash('success', '您的密码已成功重置！');
        console.log('密码已重置');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/');
  });
};