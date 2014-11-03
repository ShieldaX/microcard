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
  // 地图坐标
  location: [Number],
  // 网站地址
  site: String,
  // QQ号码
  qq: String,
  // 微信
  weixin: String,
  // 微博
  weibo: String,
  // 签名
  bio: {
    type: String
  },
  // 头像
  avatar: {
    // 图片名称含扩展名
    source: String,
    // 裁切区域
    area: [Number]
  },
  // 模板
  template: {
    type: String
  },
  // 创建记录
  created: {
    // 时间
    at: {
      type: Date,
      default: Date.now
    },
    // 创建时使用的制作码
    license: String
  }
});

// CardSchema.path('created.at').select(false);
CardSchema.path('created.license').select(false);

/**
 * Virtuals
 */
// Get hashed id
// CardSchema.virtual('hashid').get(function () {
//   return this._id;
// });
/*
CardSchema.virtual('bmap').get(function () {
  return this.location.join(',')
});
*/
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