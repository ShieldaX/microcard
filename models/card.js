//card.js

/**
 * Module dependencies.
 */
// var validator = require('validator');
var mongoose = require('mongoose');
var Schema = mongoose.Schema

/**
 * 定义用户模式
 */
var CardSchema = new Schema({
  // 持有人
  owner: {
    type: Schema.Types.ObjectId,
    required: true,
    select: false
  },
  // 姓名
  name: {
    type: String,
    // required: true
  },
  // 公司
  company: String,
  // 职位
  position: String,
  // 手机
  mobile: String,
  // 电话
  phone: String,
  // 邮箱
  email: String,
  // 传真
  fax: String,
  // 通讯地址
  address: String,
  // 网站地址
  site: String,
  // QQ号码
  qq: String,
  // 微信
  weixin: String,
  // 微博
  weibo: String,
  // 签名
  write: {
    type: String
  },
  // 头像
  avatar: {
    type: String
  },
  // 创建时使用的制作码
  license: {
    type: String,
    select: false
  },
  // 创建时间
  created: {
    type: Date,
    default: Date.now,
    select: false
  }
});

/**
 * Virtuals
 */
// Get hashed id
// CardSchema.virtual('hashid').get(function () {
//   return this._id;
// });

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


/**
 * Methods definition
 */


/**
 * Plugins
 */


module.exports = mongoose.model('Card', CardSchema);