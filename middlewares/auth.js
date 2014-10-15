//auth.js
var config = require('../config').config;
var User = require('../models/user');

//route middleware
exports.requireAuthentication = function (req, res, next) {
  if (req.user) {
    // find user in session
    //console.log(user);
    //res.locals.user = user; // just load user into response locals
    next();
  } else {
    // Unauthenticate!
    //TODO: try to reload from cookie
    //User.findByUsername(uid, function (e, u) {});
    //TODO: redirect to previous path after login
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

exports.requireLicense = function (req, res, next) {
  //
};