//license.js

/**
 * Module dependencies.
 */
// var validator = require('validator');
var mongoose = require('mongoose');
var Schema = mongoose.Schema

/**
 * License
 */
var LicenseSchema = new Schema({
  // 随机码
  code: {
    type: String,
    unique: true,
    required: true
  },
  // 活动状态
  active: {
    type: Boolean,
    default: true,
    required: true
  },
  // // 创建记录
  // created: {
  //   by: {type: Schema.Types.ObjectId, required: true}, // 申请人
  //   at: {type: Date, default: Date.now} // 创建时间
  // },
  // 创建时间
  created: {
    type: Date,
    default: Date.now
  }
});

/**
 * Validators
 */

/**
 * Indexes
 */

/**
 * Middleware
 */

/**
 * Statics definition
 */
var rn = function (max) {
  return Math.floor((Math.random() * max));
}

var base62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'

var generateRand = function(len, chars) {
  len = len || 16;
  chars = chars || base62;
  var key = '';
  var charsLen = chars.length;
  for (var i=0; i<len; i++) {
    key += chars[rn(charsLen)];
  }
  return key;
};

/**
 * 生成制作码
 */
LicenseSchema.statics.generate = function (callback) {
  // 生成6位长度的随机码
  var code = generateRand(6);
  this.create({code: code, active: true}, function (err, doc) {
    if (err) return callback(err, null);
    callback(null, doc);
  })
};

/**
 * 验证制作码
 */
LicenseSchema.statics.validate = function (code, callback) {
  code = code.toString().trim();
  if (!!code) {
    this.findOne({code: code, active: true}, function (err, doc) {
      if (err) return callback(err, false);
      if (!doc) {
        callback(new Error('Invalid Code.'), false);
      } else {
        callback(null, true);
      }
    });
  } else {
    callback(new Error('Invalid Code.'), false);
  }
};

/**
 * 注销制作码
 */
LicenseSchema.statics.invalidate = function (code, callback) {
  code = code.toString().trim();
  if (!!code) {
    this.findOne({code: code}, function (err, doc) {
      if (err) return callback(err, false);
      if (!doc) {
        callback(new Error('Invalid Code.'), false); // 未找到
      } else {
        doc.active = false;
        doc.save(function (err, doc) {
          callback(null, true); // 更新
        });
      }
    });
  } else {
    callback(new Error('Invalid Code.'), false);
  }
};

/**
 * Methods definition
 */


/**
 * Plugins
 */


module.exports = mongoose.model('License', LicenseSchema);