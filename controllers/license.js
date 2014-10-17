/**
 * 制作码控制器
 * 对系统内的制作码进行生成，注销等操作
 */
var License = require('../models/license');

/**
 * 列表
 */
exports.list = function (req, res, next) {
  License.find({}, function (error, docs) {
    if (error) return next(error);
    res.render(
      'admin/license',
      {licenses: docs, success: req.flash('message'), error: req.flash('error')}
    );
  });
};

/**
 * 处理申请
 */
exports.apply = function (req, res, next) {
  License.generate(function (error, doc) {
    if (error) {
      req.flash('error', '系统发生了未知错误 Σ( ° △ °|||)︴ ');
    } else {
      req.flash('message', 'o(*≧▽≦)ツ 成功申请了1枚硬币');
    }
    res.redirect('/admin/licenses');
  });
};

/**
 * 注销
 */
exports.use = function (req, res, next) {
  var code = req.body.code;
  if (!code) return next(new Error('None Code'));
  License.invalidate(code, function (error, success) {
    if (error) {
      req.flash('error', '系统发生了未知错误 Σ( ° △ °|||)︴ ');
    } else {
      req.flash('message', '成功消费了1枚硬币！');
    }
    res.redirect('/admin/licenses');
  });
}

