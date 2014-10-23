// 路由分配
var user = require('./controllers/user');
var card = require('./controllers/card');
var license = require('./controllers/license');
var upload = require('./controllers/upload');

// 加载中间件
var auth = require('./middlewares/auth');

module.exports = function (app) {
  app.all('*', auth.loadUser);

  // 首页
  app.get('/', function (req, res) {
    res.render('index', { title: '微名片' });
  });

  app.get('/upload', function (req, res) {
    res.render('upload', {title: '上传图片'});
  });

  app.post('/upload', upload.handleAvatar);

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
  app.all('/card/*', auth.requireAuthentication);
  app.namespace('/card', function () {

    app.get('/validate', function (req, res) {
      res.render('card/validate', {error: req.flash('error')});
    });

    app.post('/validate', card.request);

    app.get('/', auth.requireLicense, function (req, res) {
      res.render('card/form');
    });

    app.post('/', auth.requireLicense, card.create);

    app.get('/share', card.share); // ../card/share?id=xxx

    app.get('/:id', card.display);
  });

  // 移动展示端
  app.namespace('/v', function () {
    app.get('/:id', card.data, card.template);
  });

  app.all('/admin/*', auth.requireAuthentication);
  // app.all('/admin*', auth.requireAdmin);
  // 后台管理
  app.namespace('/admin', function () {
    // TODO: 单独设计管理员账户更容易控制安全性，不需要用户角色role就能满足需求
    app.get('/', function (req, res) {
      res.end('GET admin port');
    });

    app.namespace('/cards', function () {
      app.get('/:code', card.list); // 利用口令进行简单保护
    });

    app.namespace('/licenses', function () {
      app.get('/', license.list);
      app.post('/', license.apply);
      app.post('/ban', license.use);
    });
  });
};