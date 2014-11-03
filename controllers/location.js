// 地理位置控制器

var Card = require('../models/card');

// GET /card/:id/location 地图标点页面
exports.marker = function (req, res, next) {
  console.log(res.card);
  var card = res.card;
  if (card) {
    res.render('location', {title: '标注地图位置', card: card});
  } else {
    console.log('没有找到卡片');
    next();
  }
};

// POST /card/:id/location
exports.setMarker = function (req, res, next) {
  var uid = req.user.id;
  var cardid = req.param('id');
  console.log(req.body);
  var data = req.body;
  // 寻找正在操作的名片并更新
  Card.findOne({_id: cardid, owner: uid}, function (error, card) {
    if (error) {
      return res.json({success: false, data: {message: '发生错误，请稍后重试'}});
    }
    if (card) { // 编辑
      var loc = data.location.split(',');
      loc[0] = parseFloat(loc[0].trim());
      loc[1] = parseFloat(loc[1].trim());
      card.location = loc;
      // TODO: 更新地址 if any
      data.address += '';
      card.address = data.address.trim() ? data.address.trim() : card.address;
      console.log(card);
      card.save(function(err, doc) {
        if (err) return res.json({success: false, data: {message: '标注记录失败，请检查输入'}});
        res.json({success: true, data: {message: '成功记录地图标注', location: doc.location}});
      });
    } else { // 未找到卡片
      next();
    }
  });
};