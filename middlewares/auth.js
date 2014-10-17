//auth.js
var config = require('../config').config;
var User = require('../models/user');

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

exports.avoidDuplicate = function (req, res, next) {
  if (req.user) {
    req.flash('error', '已有账号登录，请注销！'); // error flash message
    res.redirect('/user/signout');
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
    User.isAdmin(user.id, function (error, admin) {
      if (error || !admin) {
        req.flash('error', '需要管理员权限！'); // error flash message
        res.redirect('back'); // res.redirect('/admin/login');
      } else {
        next();
      }
    });
  } else {
    // Forbidden!
    req.flash('error', '需要管理员权限！'); // error flash message
    res.redirect('back'); // res.redirect('/admin/login');
  }
}

exports.requireLicense = function (req, res, next) {
  //
};