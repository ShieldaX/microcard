// TODO: rename this moudule to 'assets',
// 负责处理静态资源（图片等）的管理

var fs = require('fs');

var IMG_SIZE_LIMIT = 1 * 1024 * 1024; //限制上传图片的文件大小

exports.avatar = function (req, res) {
  console.log(req.files);
  var ufile = req.files.avatar;
  if (ufile) {
    var path = ufile.path;
    var size = ufile.size;
    var typez = ufile.mimetype.split('/');
    //判断文件类型
    console.log(ufile.extension.toLowerCase());
    if (size > IMG_SIZE_LIMIT) {
      fs.unlink(path, function(args){
        // req.flash('error', '文件大于2M');
        // return res.redirect('back');
        return res.json({success: false, data: {message: '请上传小于 1M 的文件'}});
      });
    } else if (typez[0] != 'image' || ['jpg', 'png', 'jpeg'].indexOf(ufile.extension.toLowerCase()) < 0) {
      fs.unlink(path, function(args){
        // req.flash('error', '不是图片');
        // return res.redirect('back');
        return res.json({success: false, data: {message: '请上传 JPG 或 PNG 格式图片'}});
      });
    } else {
      var targetPath = 'public/uploads/images/' + ufile.name;
      console.log(targetPath);
      //将上传的临时文件移动到指定的目录下
      fs.rename(path, targetPath, function(err){
        if (err) {
          console.log(err);
          // req.flash('error', '保存失败');
          // return res.redirect('back');
          return res.json({success: false, data: {message: '保存失败'}});
        }
        res.json({success: true, data: {message: '上传成功！', path: '/uploads/images/'+ufile.name}});
        // res.render('upload', {title: '裁切图片', image_saved: '/uploads/images/'+ufile.name, success: '上传成功'});
      });
    }

  } else {
    // res.render('upload', {error: '文件未识别，请重试'});
    return res.json({success: false, data: {message: '文件未识别，请重试。'}});
  }
};

exports.handleAvatar = function (req, res, next) {
  console.log(req.files);
  if (req.files && req.files.avatar) {
    uploadAjax(req, res);
  } else {
    uploadAvatar(req, res);
  }
};

function uploadAjax(req, res) {
  var ufile = req.files.avatar;
  if (ufile) {
    var path = ufile.path;
    var size = ufile.size;
    var typez = ufile.mimetype.split('/');
    //判断文件类型
    console.log(ufile.extension.toLowerCase());
    if (size > IMG_SIZE_LIMIT) {
      fs.unlink(path, function(args){
        return res.json({success: false, data: {message: '请上传小于 1M 的文件'}});
      });
    } else if (typez[0] != 'image' || ['jpg', 'png', 'jpeg'].indexOf(ufile.extension.toLowerCase()) < 0) {
      fs.unlink(path, function(args){
        return res.json({success: false, data: {message: '请上传 JPG 或 PNG 格式图片'}});
      });
    } else {
      var targetPath = 'public/uploads/images/' + ufile.name;
      console.log(targetPath);
      //将上传的临时文件移动到指定的目录下
      fs.rename(path, targetPath, function(err){
        if (err) {
          console.log(err);
          return res.json({success: false, data: {message: '上传失败，请重试'}});
        }
        res.json({success: true, data: {message: '上传成功！', path: '/uploads/images/'+ufile.name}});
        // res.render('upload', {title: '裁切图片', image_saved: '/uploads/images/'+ufile.name, success: '上传成功'});
      });
    }

  } else {
    // res.render('upload', {error: '文件未识别，请重试'});
    return res.json({success: false, data: {message: '文件未识别，请重试'}});
  }
};

function uploadAvatar(req, res) {
  res.json(req.body);
};