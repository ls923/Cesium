var express = require("express");
var router = express.Router();
var db = require("../Database/DbConnection");
var sql = require("../Database/sql");
var model = require("../Methods/model");

router.get("/", function (req, res, next) {
  // res.render("index");
  const html = fs.readFileSync(path.resolve(__dirname, '../public/index.html'), 'utf-8')
  res.send(html)
});

//updataShow
router.get("/UpdateIsShow", function (req, res) {
  console.log("update  Show");
  console.log(req.query);
  model.updateIsShow(req, res, function (result) {
    console.log("model updateIsShow");
    console.log(result);
    res.send(result);
  });
});


//updataPosition
router.get("/UpdataPosition", function (req, res) {
  console.log("update  Position");
  console.log(req.query);
  model.updatePosition(req, res, function (result) {
    console.log("model updatePosition");
    console.log(result);
    res.send(result);
  });
});

// COunt
router.get("/getCount", function (req, res, next) {

  model.allCount(req, res, function (result) {
    console.log("AllCount ");
    console.log(result);
    // JSON.stringify(result);
    res.send(result);
  });

});

// 查询 所有  isShow = 1 的 model
router.get("/QueryAllShow", function (req, res, next) {

  model.QueryAllShow(req, res, function (result) {
    console.log("model queryAllShow");
    console.log(result);

    res.send(result);
  });

});

// 查询全部
router.get("/searchAll", function (req, res, next) {

  model.searchAll(req, res, function (result) {
    console.log("model queryAll");
    console.log(result);
    // JSON.stringify(result);
    res.send(result);
  });

});

// 查询单个
router.get("/searchFrom_model_id", function (req, res, next) {
  var fin;
  model.searchFromId(req, res, function (result) {
    console.log("model queryOne");
    console.log(result);
    fin = JSON.stringify(result);
    res.send(fin);
  });
});

module.exports = router;