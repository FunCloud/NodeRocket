//初始化配置：配置跟路径
global.root_dirName = __dirname;

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');

//var routes = require('./routes/index');
//var users = require('./routes/users');
var http = require('http');
var util =  require('util')

var Result =  require('./sys/entity/result.js');
var UmResult =  require('./sys/entity/umResult.js');
var config =  require('./sys/config/Config.js');
var StringUtil =  require('./sys/util/StringUtil.js');
var dataUtil =  require('./sys/util/dataUtil.js');
var domain = require('domain');

//配置服务对象ß
config.configServiceObj();

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// mileware config
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(bodyParser.json());
app.use(cookieParser());
//config the session;
app.use(session({
  secret: '12345',
  name: 'name',
  cookie: {maxAge: 6000000},
  resave: false,
  saveUninitialized: true,
}));
app.use(express.static(path.join(__dirname, 'public')));



process.on('uncaughtException',function(err){console.log('error, but oh well', err.message); })

//统一配置拦截器
app.all(/^\/server\/([A-Z,a-z,0-9])+!([A-Z,a-z,0-9])+$/,function(req,res){
  var url =  req.url;
  var actionName = StringUtil.getActionName(url);
  var methodName = StringUtil.getMethodName(url);
  var action = config.servicesObj[actionName];
  var params = dataUtil.getParam(req,true);
  const  pageObj = dataUtil.getPageParam(req);
  if(action&&util.isFunction(action[methodName])){

    var errorDomain = domain.create();
    errorDomain.add(req);
    errorDomain.add(res);
    errorDomain.on('error', function(err) {
      try {
        res.send(new Result(err.stack,"服务器异常,请联系管理员","FALSE"));
      } catch (err) {
        console.error(err);
        res.send(new Result(err.stack,"服务器异常,请联系管理员","FALSE"));
      }
    });
    errorDomain.run(function() {
      try {
        action[methodName](req,res,params,pageObj);
      } catch (err) {
        console.error(err);
        res.send(new Result(err.stack,"服务器异常,请联系管理员","FALSE"));
      }
    });

    /*try {
      action[methodName](req,res,params);
    } catch (err) {
      res.statusCode = 500;
      res.send(new Result(err,"服务器异常,请联系管理员","FALSE"));
    }*/
  }else{
    var result = new Result();
    result.configError(actionName+"类或"+methodName+"方法未实现!!!");
    res.send(result);
  }
})


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

http.createServer(app).listen(3000,function(req,res){
  console.info("start the server!!!");
});
module.exports = app;
