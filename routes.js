// 路由分配
var user = require('./controllers/user');
var card = require('./controllers/card');

// 加载中间件
var auth = require('./middlewares/auth');

module.exports = function (app) {
  app.all('*', auth.loadUser);

  // 首页
  app.get('/', function (req, res) {
    res.render('index', { title: '微名片' });
  });

  // 会员账户系统
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

  // 前台业务逻辑端
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

    app.get('/share', card.share); // ../card/share?id=xxx

    app.get('/qrcode/:id', card.QRcode);

    app.get('/:id', card.display);
  });

  // 移动展示端
  app.namespace('/v', function () {
    app.get('/:cid', function (req, res) {
      res.end('GET Card ' + req.params.cid + "'s View." );
    });
  });

  app.namespace('/admin', function () {
    // app.all('*', admin.validateRole);
    app.get('/m/c/:code', card.list); // 利用口令进行简单保护
  });
};