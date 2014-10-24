// TODO: rename this moudule to 'assets',
// 负责处理静态资源（图片等）的管理

var fs = require('fs');
var crypto = require('crypto');
var sharp = require('sharp');
var Card = require('../models/card');

var IMG_SIZE_LIMIT = 1 * 1024 * 1024; //限制上传图片的文件大小(byte)
var IMG_MAX_DIM = 1024; //上传图片的最大尺寸(px)
var AVATAR_DIM = 140; //默认头像尺寸(px)

exports.handleAvatar = function (req, res, next) {
  var cardid = req.param('id');
  Card.findById(cardid, function (error, card) {
    if (error) { return next(error); }
    req.card = card; // set current card in req object
    console.log(card);
    if (req.files && req.files.avatar) {
      uploadAjax(req, res);
    } else {
      uploadAvatar(req, res, next);
    }
  });
};

function uploadAjax(req, res) {
  var ufile = req.files.avatar;
  if (ufile) {
    var path = ufile.path;
    var size = ufile.size;
    var typez = ufile.mimetype.split('/');
    //判断文件类型
    // console.log(ufile.extension.toLowerCase());
    if (size > IMG_SIZE_LIMIT) {
      fs.unlink(path, function(args){
        return res.json({success: false, data: {message: '请上传小于 1M 的文件'}});
      });
    } else if (typez[0] != 'image' || ['jpg', 'png', 'jpeg'].indexOf(ufile.extension.toLowerCase()) < 0) {
      fs.unlink(path, function(args){
        return res.json({success: false, data: {message: '请上传 JPG 或 PNG 格式图片'}});
      });
    } else {
      var card = req.card;
      var md5name = crypto.createHash('md5').update(card.id).digest('hex') + '.' + ufile.extension;

      //将上传的临时文件移动到指定的目录下
      var targetPath = 'public/uploads/images/' + md5name;
      var avatarPath = 'public/uploads/avatar/' + md5name;
      var imagePath = '/uploads/images/' + md5name;
      console.log(targetPath);

      // sharp(path)
      // .resize(IMG_MAX_DIM, IMG_MAX_DIM)
      // .max()
      // .toFile(targetPath, function (err) {
      //   if (err) return res.json({success: false, data: {message: '上传失败，请重试'}});
      //   // fs.unlinkSync(path);
      //   res.json({success: true, data: {message: '上传成功！', path: '/uploads/images/'+ufile.name}});
      // });

      var img = sharp(path);
      img.metadata(function (err, metadata) {
        // 对图片裁切默认区域作为头像并记录
        var area = iniArea(metadata.width, metadata.height);
        img.extract(area.top, area.left, area.width, area.height)
        .resize(AVATAR_DIM, AVATAR_DIM)
        .sharpen()
        .quality(100)
        .toFile(avatarPath, function (err) {
          if (err) throw err;

          // 记录到名片数据库
          card.avatar = md5name;
          card.save();

          // 如果图片的尺寸大于限定值，则缩小图片至临时路径供前台调用
          if (Math.max(metadata.width, metadata.height) > IMG_MAX_DIM) {
            sharp(path)
            .resize(IMG_MAX_DIM, IMG_MAX_DIM)
            .max()
            .toFile(targetPath, function (err) {
              if (err) return res.json({success: false, data: {message: '上传失败，请重试'}});
              fs.unlinkSync(path); // 缩放完成后，删除原图
              res.json({success: true, data: {message: '上传成功！', path: imagePath}});
            });
          } else { // 否则直接移动至临时路径返回前台
            fs.rename(path, targetPath, function(err){
              if (err) {
                console.log(err);
                return res.json({success: false, data: {message: '上传失败，请重试'}});
              }
              res.json({success: true, data: {message: '上传成功！', path: imagePath}});
            });
          }

        });

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
  // var cardId = 'dafsenknckx83s8fb309kse';
  var card = req.card;
  var avatar = card.avatar;
  var tempPath = 'public/uploads/images/' + avatar;
  var avatarPath = 'public/uploads/avatar/' + avatar;
  console.log(avatarPath);

  var data = req.body;
  var path = 'public'+data.image;
  console.log(data);

  var left = Math.floor(data.x);
  var top = Math.floor(data.y);
  var width = Math.floor(data.w);
  var height = Math.floor(data.h);
  console.log(left, top, width, height);
  // 获取原图片
  fs.exists(tempPath, function(exists){
    if (exists) {
      console.log('Tempo Image Exists: ', tempPath);

      sharp(tempPath)
      .extract(top, left, width, height)
      .resize(AVATAR_DIM, AVATAR_DIM)
      .sharpen()
      .quality(100)
      .toFile(avatarPath, function (err) {
        if (err) throw err;
        console.log('Completed!');
        // fs.unlinkSync(tempPath); //成功后立即删除临时图片？
        res.json({success: true, data: {message: '头像已保存'}});
      });
    } else {
      console.log('原图已过期，请重新上传');
      res.json({success: false, data: {message: '操作超时，请重新上传'}});
    }
  });
}

// function extensionOf (file) {
//   return file.trim().split('.').pop();
// }

function iniArea (width, height) {
  var dimension = Math.min(width, height)*.9;
  var area = {
    left: width*.5 - dimension*.5,
    top: height*.5 - dimension*.5,
    width: dimension,
    height: dimension,
  };
  // console.log(area);
  return area;
}
