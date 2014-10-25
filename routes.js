// 路由分配
var user = require('./controllers/user');
var admin = require('./controllers/admin');
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

  // app.get('/upload', function (req, res) {
  //   res.render('upload', {title: '上传图片'});
  // });

  // app.post('/upload', upload.handleAvatar);

  // 会员账户系统
  app.namespace('/user', function () {
    // app.get('/', function (req, res) {
    //   res.send('GET user');
    // });
    // 用户注册
    app.get('/signup', auth.avoidRepeatSignin, user.new);
    app.post('/signup', user.create);
    // 用户登录
    app.get('/signin', auth.avoidRepeatSignin, user.login);
    app.post('/signin', user.authenticate);
    // 注销登录
    app.get('/signout', auth.requireAuthentication, user.logout);
  });

  // 前台业务逻辑端
  app.all('/card*', auth.requireAuthentication);
  app.namespace('/card', function () {

    app.get('/', function (req, res) {
      if (res.card) {
        var cid = res.card.id;
        res.redirect('/card/'+cid);
      } else {
        res.redirect('/card/validate');
      }
    });

    app.get('/validate', function (req, res) {
      res.render('card/validate', {error: req.flash('error')});
    });

    app.post('/validate', card.requestCreate);

    app.get('/:id', card.edit);

    app.post('/:id', card.update);

    // app.get('/', auth.requireLicense, function (req, res) {
    //   res.render('card/form', {title: '填写名片信息'});
    // });

    // app.post('/', auth.requireLicense, card.create);

    app.get('/:id/share', card.share); // ../card/share?id=xxx

    // app.get('/:id', card.display);

    app.get('/:id/avatar', upload.avatarForm);

    app.post('/:id/avatar', upload.handleAvatar);

    // app.get('/:id/template', auth.loadCard, card.templateForm);

    // app.post('/:id/template', auth.loadCard, card.updateTemplate);
  });

  // 移动展示端
  app.namespace('/v', function () {
    app.get('/:id', card.data, card.template);
  });

  app.all('/admin*', auth.requireAuthentication, auth.requireAdmin);
  // app.all('/admin*', auth.requireAdmin);
  // 后台管理
  app.namespace('/admin', function () {
    //TODO: 单独设计管理员账户更容易控制安全性，不需要用户角色role就能满足目前需求

    app.get('/', admin.index);

    app.get('/cards', card.list);

    app.namespace('/licenses', function () {
      app.get('/', license.list);
      app.post('/', license.apply);
      app.post('/ban', license.use);
    });
  });
};