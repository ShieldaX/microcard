// 管理员控制器
exports.index = function (req, res, next) {
  res.render('admin/index', {title: '运营管理'});
};