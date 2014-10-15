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
  // 姓名
  name: {
    type: String,
    required: true
  },
  // 公司
  company: String,
  // 职位
  position: String,
  // 电话
  phone: String,
  // 手机
  mobile: String,
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
  // 阿里旺旺
  wangwang: String,
  // 创建时间
  created: {
    type: Date,
    default: Date.now,
    select: false
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


/**
 * Methods definition
 */


/**
 * Plugins
 */


module.exports = mongoose.model('Card', CardSchema);