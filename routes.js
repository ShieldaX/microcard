// 路由分配
var user = require('./controllers/user');
var card = require('./controllers/card');

// 加载中间件
var auth = require('./middlewares/auth');

module.exports = function (app) {
  app.all('*', auth.loadUser);

  app.get('/', function (req, res) {
    res.render('index', { title: '微名片' });
  });

  app.get('/admin/cards/:code', card.list); // 利用口令进行简单保护

  app.namespace('/user', function () {
    // app.get('/', function (req, res) {
    //   res.send('GET user');
    // });
    // 用户注册
    app.get('/signup', user.new);
    app.post('/signup', user.create);
    // 用户登录
    app.get('/signin', user.login);
    app.post('/signin', user.authenticate);
    // 注销登录
    app.get('/signout', auth.requireAuthentication, user.logout);
  });

  app.namespace('/card', function () {
    app.all('*', auth.requireAuthentication);

    app.get('/validate', function (req, res) {
      res.render('card/validate');
    });

    app.post('/validate', card.request);

    app.get('/', function (req, res) {
      res.render('card/form');
    });

    app.post('/', card.create);

    app.get('/share', card.share);

    app.get('/qrcode/:id', card.QRcode);

    app.get('/:id', card.display);
  });

  // app.namespace('/admin', function () {
  //   app.all('*', admin.validateRole);
  // });
};