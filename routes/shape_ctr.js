var express = require("express");
var router = express.Router();
var db = require("../Database/DbConnection");
var sql = require("../Database/sql");
var shape = require("../Methods/shape");

router.get("/", function (req, res, next) {
  // res.render("index");
  const html = fs.readFileSync(path.resolve(__dirname, '../public/index.html'), 'utf-8')
  res.send(html)
});

//添加
router.post("/new", function (req, res) {
  shape.addShape(req, res, function (result, status) {
    console.log("status");
    console.log(status);
    if (status == 1) {
      res.send(result);
    } else {
      res.send("error");
    }

  });
});

// COunt
router.get("/getCount", function (req, res, next) {

  shape.allCount(req, res, function (result) {
    console.log("AllCount ");
    console.log(result);
    // JSON.stringify(result);
    res.send(result);
  });

});

router.get("/getPositions", function (req, res, next) {
  shape.getPositions(req, res, function (result) {
    console.log("positions:");
    console.log(result);

    res.send(result);
  });

});

router.post("/post_positions", function (req, res) {
  shape.savePositions(req, res, function (result) {
    res.send(result);
  });
});

//删除
router.get("/delete", function (req, res) {
  var param = req.query;
  var id = param.delete_id;
  db.queryArgs(sql.object_delete, [id], function (err, result) {
    if (err) {
      console.log("[DELETE ERROR] -", err.message);
      res.send(err);
    } else {
      res.send("Delete Success");
    }
  });
});

router.get("/searchAll", function (req, res, next) {
  shape.searchAll(req, res, function (result) {
    // res.render('index',{webs:result});
    console.log("shape");
    console.log(result);
    res.send(JSON.stringify(result));
  });
});

module.exports = router;