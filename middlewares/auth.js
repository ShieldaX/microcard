//auth.js
var config = require('../config').config;
var User = require('../models/user');
var Card = require('../models/card');

//route middleware
exports.requireAuthentication = function (req, res, next) {
  if (req.user) {
    next();
  } else {
    // Unauthenticate!
    //TODO: redirect to previous path after login
    console.log(req.originalUrl);
    // var callbackQuery = '/?callback=' + req.originalUrl;
    req.flash('error', '请先登录账号！'); // error flash message
    res.redirect('/user/signin');
  }
};

exports.avoidRepeatSignin = function (req, res, next) {
  // console.log(req.authenticate);
  if (req.user) {
    // req.flash('error', '已有账号登录，请先注销！'); // error flash message
    res.redirect('back');
  } else {
    next();
  }
}

exports.loadUser = function (req, res, next) {
  res.locals.user = req.user
  next();
};

exports.requireAdmin = function (req, res, next) {
  if (!!req.user) {
    //TODO: TOO BAD 临时解决办法
    var isAdmin = config.administrators && config.administrators.length && config.administrators.indexOf(req.user.local.email) >= 0;
    if (isAdmin) {
      next();
    } else {
      res.redirect('/');
    }
  } else {
    // Forbidden!
    // req.flash('error', '需要管理员权限！'); // error flash message
    res.redirect('back'); // res.redirect('/admin/login');
  }
}
/*
// 用户账户已激活
exports.ensureActiveUser = function (req, res, next) {
  var user = req.user;
  if (user) {
    if (!user.isActive) {
      res.redirect('/user/confirm');
    } else {
      next();
    }
  } else {
    res.redirect('/user/signin');
  }
};*/

exports.loadUserCardById = function (req, res, next) {
  var uid = req.user.id;
  var cid = req.param('id');
  if (typeof cid == 'undefined') return next();
  Card.findOne({_id: cid, owner: uid}, function (error, card) {
    //查找时发生错误
    if (error) {return next(error);}

    if (card) { //成功找到名片
      res.card = card;
    }

    next();
  });
};