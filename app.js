var createError = require("http-errors");
var cookieParser = require("cookie-parser");

var logger = require("morgan");
var path = require("path");

//引入 express 模块
var express = require("express");
//引入 hbs 模块
var hbs = require("hbs");
//创建 express 实例
var app = express();

var indexRouter = require("./routes/index");
var ShapeRouter = require("./routes/shape_ctr");
var ModelRouter = require("./routes/model_ctr");
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.engine(".html", hbs.__express);
app.set("view engine", "html");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/add_shape", ShapeRouter);
app.use("/model", ModelRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;