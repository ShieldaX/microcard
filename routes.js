// 路由分配
var user = require('./controllers/user');
var passport = require('passport');
var admin = require('./controllers/admin');
var card = require('./controllers/card');
var license = require('./controllers/license');
var upload = require('./controllers/upload');
var location = require('./controllers/location');

// 加载中间件
var auth = require('./middlewares/auth');

module.exports = function (app) {
  app.all('*', auth.loadUser);

  // 首页
  app.get('/', function (req, res) {
    res.render('new_index', { title: '微名片' });
  });

  // 会员第三方登录
  app.namespace('/auth', function () {
    app.get('/', function (req, res) { res.render('user/auth'); });
  });

  // 会员账户系统
  app.namespace('/user', function () {
    // 用户注册
    app.get('/signup', auth.avoidRepeatSignin, user.new);
    app.post('/signup', user.create);
    // 用户登录
    app.get('/signin', auth.avoidRepeatSignin, user.login);
    app.post('/signin', user.authenticate);
    // 注销登录
    app.get('/signout', auth.requireAuthentication, user.logout);
    /* 用户激活
    app.get('/confirm', auth.requireAuthentication, user.confirm);
    app.post('/confirm', auth.requireAuthentication, user.sendActiveMail);
    app.get('/active/:token', user.active);*/
    // 重置密码
    app.get('/forgot', user.forgot);
    app.post('/forgot', user.sendResetMail);
    app.get('/reset/:token', user.resetPasswd);
    app.post('/reset/:token', user.doResetPasswd);
    // 快捷登陆

    app.namespace('/auth', function () {
      app.get('/', function (req, res) {
        res.render('user/auth', {title: '快捷登录', error: req.flash('error')});
      });

      app.get('/github', passport.authenticate('github'));
      app.get('/github/callback',
        passport.authenticate('github', {
          failureRedirect: '/user/auth',
          failureFlash: '授权被取消'
        }),
        function (req, res) {
          res.redirect('/');
        }
      );

      app.get('/weibo', passport.authenticate('weibo'));
      app.get('/weibo/callback',
        passport.authenticate('weibo', {
          failureRedirect: '/user/auth',
          failureFlash: '授权被取消'
        }),
        function (req, res) {
          res.redirect('/');
        }
      );

      app.get('/weibo/cancel', user.weiboCancel);

    });
  });

  // 前台业务逻辑端
  app.all('/card*', auth.requireAuthentication);
  app.namespace('/card', function () {

    app.get('/', card.master);

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

    app.get('/:id/avatar', auth.loadUserCardById, upload.avatarForm);

    app.post('/:id/avatar', upload.handleAvatar);

    app.get('/:id/location', auth.loadUserCardById, location.marker);

    app.post('/:id/location', location.setMarker);

    app.get('/:id/template', auth.loadUserCardById, card.chooseTemplate);

    app.post('/:id/template', auth.loadUserCardById, card.setTemplate);
  });

  // 移动展示端
  app.namespace('/v', function () {
    app.get('/:id', card.data, card.display);
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

  app.all('*', function(req, res) {
    console.log(req.path);
    console.log('404 handler..');
    res.render('404', {
      status: 404,
      title: '页面不存在',
    });
  });
};