// TODO: rename this moudule to 'assets',
// 负责处理静态资源（图片等）的管理

var fs = require('fs');
var mkdirp = require('mkdirp');
// var crypto = require('crypto');
var sharp = require('sharp');
var Card = require('../models/card');

var IMG_SIZE_LIMIT = 1 * 1024 * 1024; //限制上传图片的文件大小(byte)
var IMG_MAX_DIM = 512; //上传图片的最大尺寸(px)
var AVATAR_DIM = 140; //默认头像尺寸(px)

exports.avatarForm = function (req, res, next) {
  console.log(res.card);
  var card = res.card;
  if (card) {
    res.render('card/avatar', {title: '设置名片头像', card: card});
  } else {
    console.log('没有找到卡片');
    next();
  }
};

exports.handleAvatar = function (req, res, next) {
  var cardid = req.param('id');
  Card.findById(cardid, function (error, card) {
    if (error) { return next(error); }
    if (card) {
      req.card = card; // set current card in req object
      console.log(card);
      if (req.files && req.files.avatar) {
        uploadAjax(req, res);
      } else {
        uploadAvatar(req, res, next);
      }
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
      // 上传图片合法

      // 检查路径
      if (fs.existsSync('public/uploads')) {
        if (!fs.existsSync('public/uploads/images')) {
          mkdirp('public/uploads/images', function (err) { if (err) console.error(err); });
        }
        if (!fs.existsSync('public/uploads/avatar')) {
          mkdirp('public/uploads/avatar', function (err) { if (err) console.error(err); });
        }
      } else {
        mkdirp('public/uploads/images', function (err) {
          if (err) {
            console.error(err);
          } else {
            mkdirp('public/uploads/avatar', function (err) {
              if (err) {
                console.error(err);
              } else {
                console.log('Essential DIRs Has Been Rebuild!');
              }
            });
          }
        });
      }

      var card = req.card;
      // 异步删除原来的图片 if any
      var source = card.avatar.source;
      if (source) {
        console.log('删除旧图片：', source);
        fs.unlink('public/uploads/images/'+source, function (err) {
          if (err) {console.log(err);}
        });
        fs.unlink('public/uploads/avatar/'+source, function (err) {
          if (err) {console.log(err);}
        });
      };
      // var md5name = crypto.createHash('md5').update(card.id).digest('hex') + '.' + ufile.extension;
      var filename = ufile.name;
      console.log('tmpl name: ', filename);
      //将上传的临时文件移动到指定的目录下
      var targetPath = 'public/uploads/images/' + filename;
      var avatarPath = 'public/uploads/avatar/' + filename;
      var imagePath = '/uploads/images/' + filename;

      sharp(path)
      .metadata(function (err, metadata) {
        // 判断图片大小
        var max_img_dim = Math.max(metadata.width, metadata.height);
        // 如果图片的尺寸大于限定值，则缩小图片至目标路径供前台调用
        if (max_img_dim > IMG_MAX_DIM) {
          console.log('需要缩小图片至：', IMG_MAX_DIM);
          sharp(path)
          .resize(IMG_MAX_DIM, IMG_MAX_DIM)
          .max()
          .toFile(targetPath, function (err) {
            if (err) return res.json({success: false, data: {message: '上传失败，请重试'}});
            fs.unlinkSync(path); // 缩小完成后，删除原图
            var scaleRatio = IMG_MAX_DIM/Math.max(metadata.width, metadata.height);
            console.log('计算出缩放后的裁切区域...');
            var area = iniArea(metadata.width*scaleRatio, metadata.height*scaleRatio);
            sharp(targetPath)
            .extract(area.top, area.left, area.width, area.height)
            .resize(AVATAR_DIM, AVATAR_DIM)
            .sharpen()
            .quality(100)
            .toFile(avatarPath, function (err) {
              if (err) return console.log(err);
              // 同时记录到名片数据库
              card.avatar.source = filename;
              card.avatar.area = [area.left, area.top, area.width, area.height], // [x, y, w, h]
              card.save(function (err, doc) {
                if (err) return console.log(err);
                console.log('数据库更新：');
                console.log(doc);
                // 结束后台操作，返回数据
                res.json({success: true, data: {message: '上传成功！', avatar: doc.avatar}});
              });
            });
          });
        } else {
          console.log('不需要缩小图片！');
          // 否则直接移动至目标路径返回前台
          fs.rename(path, targetPath, function(err){
            if (err) {
              console.log(err);
              return res.json({success: false, data: {message: '上传失败，请重试'}});
            }
            // 计算裁切区域
            var area = iniArea(metadata.width, metadata.height);
            sharp(targetPath)
            .extract(area.top, area.left, area.width, area.height)
            .resize(AVATAR_DIM, AVATAR_DIM)
            .sharpen()
            .quality(100)
            .toFile(avatarPath, function (err) {
              if (err) return console.log(err);
              // 同时记录到名片数据库
              card.avatar.source = filename;
              card.avatar.area = [area.left, area.top, area.width, area.height], // [x, y, w, h]
              card.save(function (err, doc) {
                if (err) throw err;
                console.log(doc);
              });
              // 结束后台操作，返回数据
              res.json({success: true, data: {message: '上传成功！', avatar: card.avatar}});
            });
          });
        }

      });
    }

  } else {
    return res.json({success: false, data: {message: '文件未识别，请重试'}});
  }

};

function uploadAvatar(req, res, next) {
  var card = req.card;
  var avatar = card.avatar.source;
  var imagePath = 'public/uploads/images/' + avatar;
  var avatarPath = 'public/uploads/avatar/' + avatar;

  var data = req.body;
  var path = 'public'+data.image;
  console.log(data);

  var left = data.x;
  var top = data.y;
  var width = data.w;
  var height = data.h;

  // 获取上传的图片，进行裁切
  fs.exists(imagePath, function(exists){
    if (exists) {
      console.log('Tempo Image Exists: ', imagePath);
      // TODO: 比较新旧裁切区域，如果没有更改，则不进行实际的裁切，直接返回
      sharp(imagePath)
      .extract(top, left, width, height)
      .resize(AVATAR_DIM, AVATAR_DIM)
      .sharpen()
      .quality(100)
      .toFile(avatarPath, function (err) {
        if (err) throw err;
        console.log('Completed!');
        // 更新数据库
        card.avatar.area = [left, top, width, height];
        card.save();
        res.json({success: true, data: {message: '头像已保存'}});
      });
    } else {
      // TODO: 尝试使用 POST 过来的 body.image
      console.log('原图已过期，请重新上传');
      res.json({success: false, data: {message: '操作超时，请重新上传'}});
    }
  });
}

function iniArea (width, height) {
  var dimension = Math.min(width, height)*.9;
  var area = {
    left: width*.5 - dimension*.5,
    top: height*.5 - dimension*.5,
    width: dimension,
    height: dimension,
  };
  console.log(area);
  return area;
}
