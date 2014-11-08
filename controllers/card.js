var _ = require("underscore");
// var qrcode = require('yaqrcode');

var License = require('../models/license');
var Card = require('../models/card');

// POST /card/validate
exports.requestCreate =function (req, res, next) {
  var owner = req.user.id;     // 当前登录用户
  var license = req.body.code; // 制作码
  var data = {                 // 新名片的初始化信息
    owner: owner,
    template: 'templ0'
  };
  // if (!!req.user.email) { data.email = req.user.email; }
  // TODO: 检查是否系统用户，或者是否有权创建 TOKEN?
  License.validate(license, function (error, valid) {
    if (error || !valid) {
      req.flash('error', '制作码不正确或已失效，请使用有效制作码');
      res.redirect('/card/validate');
    } else if (valid) {
      // 制作码有效，开始制作
      data.created = {
        at: Date.now(),
        license: license
      };
      // console.log(data);
      Card.create(data, function (error, card) {
        if (error) { return next(error); }
        console.log('Card created: ');
        console.log(card);
        // card.save();
        // 名片创建成功，注销制作码
        License.invalidate(license, function (error, success) {
          if (error || !success) {
            next(error || new Error('Unknown Error'));
          } else {
            // req.flash('info', '开始制作属于你的个性名片吧！');
            res.redirect('/card/' + card.id);
          }
        });
      });
    }
  });
};

// GET /card/:id
exports.edit = function (req, res, next) {
  var uid = req.user.id;
  var cardid = req.param('id');
  console.log(cardid, uid);
  Card.findOne({_id: cardid, owner: uid}, function (error, card) {
    if (error) { return next(error); }
    if (card) { // 编辑
      console.log(card);
      var success = req.flash('info');
      res.render('card/form', {title: '编辑名片', card: card, success: success});
    } else { // 未找到或无权编辑名片
      // res.redirect('/404');
      next();
    }
  });
};

// POST /card/:id
exports.update = function (req, res, next) {
  var uid = req.user.id;
  var cardid = req.param('id');
  var data = req.body; // 编辑结果
  console.log(data);
  // data.owner = uid; // 防止篡改
  // delete data.token;
  Card.findOne({_id: cardid, owner: uid}, function (error, card) {
    if (error) { return next(error); }
    if (card) { // 编辑
      card = _.extend(card, data);
      console.log(card);
      card.save(function(err, doc) {
        if (err) next(err);
        req.flash('info', '名片已成功更新');
        res.redirect('/card/'+cardid);
      });
      // res.render('card/form', {title: '编辑名片', card: card});
    } else { // 未找到卡片
      next();
      // res.redirect('/404');
    }
  });
};

// GET /card/:id/template
exports.chooseTemplate = function (req, res, next) {
  if(res.card) {
    res.render('card/template', {title: '选择模板', card: res.card});
  } else {
    next();
  }
};

// POST /card/:id/template
exports.setTemplate = function (req, res, next) {
  var uid = req.user.id;
  var cardid = req.param('id');
  var templ = req.body.template; // 模板名称
  console.log('Choosed template named: ', templ);
  Card.findOne({_id: cardid, owner: uid}, function (error, card) {
    if (error) {
      // return next(error);
      return res.json({success: false, data: {message: '主题更换失败，重启浏览器重试'}});
    }
    if (card) { // 编辑
      // TODO: 检查是否为合法模板名称，如不是则不修改数据库
      card.template = templ;
      console.log(card);
      card.save(function(err, doc) {
        if (err) next(err);
        // res.redirect('/card/'+cardid+'/share');
        res.json({success: true, data: {message: '成功更换主题', template: templ}});
      });
      // res.render('card/form', {title: '编辑名片', card: card});
    } else { // 未找到卡片
      next();
      // res.redirect('/404');
    }
  });
};

// GET /card/:id/share
exports.share = function (req, res) {
  var cid = req.params.id;
  res.render('card/share', {title: '分享名片', cid: cid});
};

// 管理页面调用
exports.list = function (req, res, next) {
  // if (req.params.code !== '13eta') return res.redirect('/');
  Card.find({}, function (error, cards) {
    if (error) { return next(error); }
    // res.render('admin/list', {cards: JSON.stringify(cards)});
    res.render('admin/list', {cards: cards});
  });
  /*
  var limitPerQuery = 20;
  Card.find().limit(limitPerQuery).exec(function (error, cards) {
    if (error) { return next(error); }
    // res.render('admin/list', {cards: JSON.stringify(cards)});
    res.render('admin/list', {cards: cards});
  });
  */
};

// 公共中间件，根据ID尝试返回名片信息
exports.data = function (req, res, next) {
  var cardid = req.param('id');
  Card.findById(cardid, function (error, card) {
    if (error) { return next(error); }
    res.card = card;
    next();
  });
};

// 在移动端显示(根据模板)
exports.display = function (req, res, next) {
  var card = res.card;
  if (card) {
    var template = card.template || req.query.tpl || 'templ0'; // 默认使用 templ0
    console.log('Renders card with template named: ', template);
    res.render('templates/' + template, {card: card});
  } else {
    // res.status(404).end();
    next();
  }
};

// GET /card
exports.master = function (req, res, next) {
  var uid = req.user.id;
  // try to load current userz cards
  Card.find({owner: uid}, function (err, docs) {
    if (err) return next(err);
    var numcard = docs.length;
    if (numcard) {
      //*
      if (numcard == 1) {
        var cid = docs[0].id;
        console.log('Find vcard: ', cid);
        res.redirect('/card/'+cid);
      } else {
        // res.redirect('/card/validate');
        res.render('card/mine', {cards: docs});
      }
    } else { // 没有创建过名片
      res.redirect('/card/validate');
    }
  });
};