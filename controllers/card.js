var _ = require("underscore");

var License = require('../models/license');
var Card = require('../models/card');

exports.request = function (req, res) {
  //验证码 mock
  var code = req.body.code;
  var isValidCode;
  isValidCode = !!code;
  // 将制作吗存入session以备验证
  // console.log(typeof req.session.validcode);
  License.validate(code, function (error, valid) {
    if (error || !valid) {
      req.flash('error', '验证码不正确，请重新输入');
      res.redirect('back');
    } else {
      req.session.license = code;
      res.redirect('/card');
    }
  });
};

// POST /card/validate
exports.requestCreate =function (req, res, next) {
  var owner = req.user.id;     // 当前登录用户
  var license = req.body.code; // 制作码
  var data = {                 // 新名片的初始化信息
    owner: owner
  };
  // if (!!req.user.email) { data.email = req.user.email; }
  // TODO: 检查是否系统用户，或者是否有权创建

  License.validate(license, function (error, valid) {
    if (error || !valid) {
      req.flash('error', '制作码不正确或已失效，请使用有效制作码');
      res.redirect('/card/validate');
    } else if (valid) {
      // 制作码有效，开始制作
      data.license = license;
      console.log(data);
      Card.create(data, function (error, card) {
        if (error) { return next(error); }
        console.log('Card created');
        // 名片创建成功，注销制作码
        License.invalidate(license, function (error, success) {
          if (error || !success) {
            next(error || new Error('Unknown Error'));
          } else {
            // TODO: hash mongodb id with hashids
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
      res.render('card/form', {title: '编辑名片', card: card});
    } else { // 未找到或无权编辑名片
      res.status(404);
      res.end();
    }
  });
};

// POST /card/:id
exports.update = function (req, res, next) {
  var uid = req.user.id;
  var cardid = req.param('id');
  var data = req.body; // 编辑结果
  console.log(data);
  data.owner = uid; // 防止篡改
  // delete data.token;
  Card.findOne({_id: cardid, owner: uid}, function (error, card) {
    if (error) { return next(error); }
    if (card) { // 编辑
      card = _.extend(card, data);
      card.save(function(err, doc) {
        if (err) next(err);
        res.redirect('/');
      });
      // res.render('card/form', {title: '编辑名片', card: card});
    } else { // 未找到卡片
      res.status(404);
      res.end();
    }
  });
};

exports.create = function (req, res, next) {
  var owner = req.user.id;
  var data = req.body;
  data.owner = owner;
  // TODO: 检查是否系统用户，或者是否有权创建
  console.log(data);
  var license = req.session.license;
  License.validate(license, function (error, valid) {
    if (error || !valid) {
      req.flash('error', '制作码不正确或失效，请使用有效制作码');
      res.redirect('/card/validate');
    } else {
      Card.create(data, function (error, card) {
        if (error) { return next(error); }
        console.log('Card created');
        License.invalidate(license, function (error, success) {
          if (error || !success) {
            next(error || new Error('Unknown Error'));
          } else {
            delete req.session.license // 名片创建成功，注销制作码
            // TODO: hash mongodb id with hashids
            res.redirect('/card/' + card.id);
          }
        });
      });
    }
  });
};

// GET /card/:id/share
exports.share = function (req, res) {
  res.render('card/share');
};

exports.display = function (req, res, next) {
  var cardid = req.param('id');
  Card.findById(cardid, function (error, card) {
    if (error) { return next(error); }
    var vcard = JSON.stringify(card.toJSON());
    console.log(vcard);
    res.render('card/card', {vcard: vcard});
  });
};

exports.list = function (req, res, next) {
  // if (req.params.code !== '13eta') return res.redirect('/');
  Card.find({}, function (error, cards) {
    if (error) { return next(error); }
    // res.render('admin/list', {cards: JSON.stringify(cards)});
    res.render('admin/list', {cards: cards});
  });
};

exports.data = function (req, res, next) {
  var cardid = req.param('id');
  Card.findById(cardid, function (error, card) {
    if (error) { return next(error); }
    // var vcard = JSON.stringify(card.toJSON());
    // console.log(vcard);
    res.card = card;
    next();
    // res.render('card/display', {card: card});
  });
};

exports.template = function (req, res) {
  var card = res.card;
  if (card) {
    var template = card.template || req.query.tpl || 'templ1';
    // template = /templ/.test(req.query.tpl) ? 'templ' + req.query.tpl : 'templ0';
    console.log('Renders card with template named: ', template);
    res.render('templates/' + template, {card: card});
  }
};