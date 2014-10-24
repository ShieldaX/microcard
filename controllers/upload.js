// TODO: rename this moudule to 'assets',
// 负责处理静态资源（图片等）的管理

var fs = require('fs');
var sharp = require('sharp');

var IMG_SIZE_LIMIT = 1 * 1024 * 1024; //限制上传图片的文件大小(byte)
var IMG_MAX_DIM = 1024; //上传图片的最大尺寸(px)
var AVATAR_DIM = 140; //默认头像尺寸(px)

exports.handleAvatar = function (req, res, next) {
  if (req.files && req.files.avatar) {
    uploadAjax(req, res);
  } else {
    uploadAvatar(req, res, next);
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
      sharp(path)
      .resize(IMG_MAX_DIM, IMG_MAX_DIM)
      .max()
      .toFile(targetPath, function (err) {
        if (err) return res.json({success: false, data: {message: '上传失败，请重试'}});
        fs.unlinkSync(path);
        res.json({success: true, data: {message: '上传成功！', path: '/uploads/images/'+ufile.name}});
      });
      // fs.rename(path, targetPath, function(err){
      //   if (err) {
      //     console.log(err);
      //     return res.json({success: false, data: {message: '上传失败，请重试'}});
      //   }
      //   res.json({success: true, data: {message: '上传成功！', path: '/uploads/images/'+ufile.name}});
      //   // res.render('upload', {title: '裁切图片', image_saved: '/uploads/images/'+ufile.name, success: '上传成功'});
      // });
    }

  } else {
    // res.render('upload', {error: '文件未识别，请重试'});
    return res.json({success: false, data: {message: '文件未识别，请重试'}});
  }
};

function uploadAvatar(req, res, next) {
  var cardId = 'dafsenknckx83s8fb309kse';

  var data = req.body;
  var path = 'public'+data.image;
  console.log(data);
  var left = Math.floor(data.x);
  var top = Math.floor(data.y);
  var width = Math.floor(data.w);
  var height = Math.floor(data.h);
  console.log(left, top, width, height);
  // 获取原图片
  fs.exists(path, function(exists){
    console.log(exists);
    if (exists) {
      console.log('Origin Image Exists: ', path);

      sharp(path)
      .extract(top, left, width, height)
      .resize(120, 120)
      .sharpen()
      .quality(100)
      .toFile('public/uploads/avatar/'+cardId+'.jpg', function (err) {
        if (err) throw err;
        console.log('Completed!');
        res.json({success: true, data: {message: '头像已保存'}});
      });
    } else {
      console.log('原图已过期，请重新上传');
      res.json({success: false, data: {message: '操作超时，请重新上传'}});
    }
  });
}

function extensionOf (file) {
  return file.trim().split('.').pop();
}
