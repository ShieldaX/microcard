// 路由分配
var card = require('./controllers/card');

module.exports = function (app) {
  app.get('/', function (req, res) {
    res.render('index', { title: 'Express' });
  });

  app.get('/entercode', function (req, res) {
    res.render('entercode');
  });

  app.post('/card/request', card.request);

  app.get('/card', function (req, res) {
    res.render('form');
  });

  app.post('/card', card.create);

  app.get('/card/:id', card.display);
};