var Card = require('../models/card');

exports.request = function (req, res) {
  //验证码 mock
  var code = req.body.code;
  var isValidCode;
  isValidCode = !!code;
  // 将制作吗存入session以备验证
  if (isValidCode) {
    res.redirect('/card');
  } else {
    console.log('invalid code entered');
  }
};

exports.create = function (req, res, next) {
  var data = req.body;
  console.log(data);
  Card.create(data, function (error, card) {
    if (error) { return next(error); }
    console.log('Card created');
    res.redirect('/card/' + card.id);
  });
  // res.json(data);
};

exports.QRcode = function (req, res) {
  res.render('card/qrcode');
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
    res.render('admin/list', {cards: JSON.stringify(cards)});
  });
};