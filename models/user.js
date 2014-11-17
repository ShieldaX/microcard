//user.js

/**
 * Module dependencies.
 */
// var validator = require('validator');
var bcrypt = require('bcrypt-nodejs');
// var crypto = require('crypto');

var mongoose = require('mongoose');
var Schema = mongoose.Schema
// var passportLocalMongoose = require('passport-local-mongoose');

/**
 * 定义用户模式
 */
var UserSchema = new Schema({
  local: {
    email: {
      type: String,
      lowercase: true,
      trim: true
    },
    password: String
  },
  github: {
    id: String,
    token: String,
    email: String,
    name: String
  },
  weibo: {
    id: String,
    token: String,
    email: String,
    name: String
  }
});


/**
 * Validators
 */
// UserSchema.path('email').validate(function(email) {
//   var isEmail = validator.isEmail(email);
//   return isEmail;
// }, 'Invalid email format');

/**
 * Indexes
 */

/**
 * Virtuals
 */
UserSchema.virtual('email').get(function () {
  return this.local.email || this.github.email || this.weibo.name;
});

UserSchema.virtual('isActive').get(function () {
  if (this.local && this.local.activeToken) {
    return false;
  }
  return true;
});

/**
 * Middleware
 */

UserSchema.pre('save', function(next) {
  var user = this;
  var SALT_FACTOR = 5;

  if (!user.isModified('local.password')) return next();

  // 修改密码时自动进行 hash
  bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.local.password, salt, null, function(err, hash) {
      if (err) return next(err);
      user.local.password = hash;
      next();
    });
  });
});

/**
 * Statics definition
 */

// UserSchema.statics.isAdmin = function (id, calback) {
//   this.findOne({_id: id, role: 'administrator'}, function (error, doc) {
//     if (error) return callback(error);
//     if (doc) return callback(null, true);
//     callback(new Error("Not administrator, forbidden!"));
//   });
// };

/**
 * Methods definition
 */

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.local.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

/**
 * Plugins
 */

// Passport plugin
// var passportOpts = {
//   usernameField: 'email',
//   selectFields: 'email'
// };

// UserSchema.plugin(passportLocalMongoose, passportOpts);
// UserSchema.plugin(passportLocalMongoose, {usernameField: 'email'});

module.exports = mongoose.model('User', UserSchema);