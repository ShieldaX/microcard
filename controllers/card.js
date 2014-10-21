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
  if (req.params.code !== '13eta') return res.redirect('/');
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
}