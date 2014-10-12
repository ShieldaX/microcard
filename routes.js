// 路由分配
var card = require('./controllers/card');

module.exports = function (app) {
  app.get('/', function (req, res) {
    res.render('index', { title: '微名片' });
  });

  app.get('/validate', function (req, res) {
    res.render('validate');
  });

  app.post('/validate', card.request);

  app.get('/card', function (req, res) {
    res.render('form');
  });

  app.post('/card', card.create);

  app.get('/card/qrcode/:id', card.QRcode);

  app.get('/card/:id', card.display);

  app.get('/admin/cards/:code', card.list); // 利用口令进行简单保护
};