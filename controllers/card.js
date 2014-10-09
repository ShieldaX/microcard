var Card = require('../models/card');

exports.request = function (req, res) {
  //验证码 mock
  // var isValidCode;
  // 将制作吗存入session以备验证
  res.redirct('/card/create');
};

exports.create = function (req, res, next) {
  var data = req.body;
  Card.create(data, function (error, card) {
    if (error) { return next(error); }
    console.log('Card created');
    next();
  });
};

exports.genQRcode = function (req, res) {

};

exports.display = function (req, res) {
  var cardid = req.param('id');
  Card.findById(cardid, function (error, card) {
    if (error) { return next(error); }

  });
  res.render('card', );
};