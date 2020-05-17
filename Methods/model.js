var sql = require("../Database/sql");
var db = require("../Database/DbConnection");

function allCount(req, res, callback) {
  db.query(sql.model_allCount, function (err, rows) {
    if (err) {
      return callback(err);
    } else {
      console.log(rows);
      return callback(rows);
    }
  });
};
//查询全部
function searchAll(req, res, callback) {
  var result = {};
  var param = req.query;
  var page = param.page;
  var limit = param.limit;
  var num1 = (parseInt(page) - 1) * parseInt(limit);
  var num2 = parseInt(limit);
  console.log(param, num1, num2);
  db.queryArgs(sql.model_queryAll, [num1, num2], function (err, rows) {
    if (err) {
      console.log("[SELECT ERROR]  - ", err.message);
      return callback(err);
    } else {
      result = {
        status: 0,
        msg: "QueryAll MODEL Success",
        total: "",
        data: rows,
      };
      callback(result);
    }
  });
}
//  isShow = 1
function updateIsShow(req, res, callback) {
  var param = req.query;
  var id = param.model_id;
  var isShow = param.isShow;
  var result = {};
  db.queryArgs(sql.model_updataIsShow, [isShow, id], function (err, rows) {
    if (err) {
      console.log("[UPDATE ERROR]  - ", err.message);
      return callback(err);
    } else {
      result = rows;
      console.log("result");
      console.log(result);
      callback(result);
    }
  });
}

// updatePosition
function updatePosition(req, res, callback) {
  var param = req.query;
  var id = param.model_id;
  var model_position = param.position;
  console.log("model_position", model_position)
  var t = JSON.parse(model_position)
  console.log(t)

  var result = {};
  db.queryArgs(sql.model_updatePosition, [t, id], function (err, rows) {
    if (err) {
      console.log("[UPDATE ERROR]  - ", err.message);
      return callback(err);
    } else {
      result = rows;
      console.log("result");
      console.log(result);
      callback(result);
    }
  });
}

//  search all isShow=1
function QueryAllShow(req, res, callback) {
  var result = {};
  db.query(sql.model_queryAllShow, function (err, rows) {
    if (err) {
      console.log("[SELECT ERROR]  - ", err.message);
      return callback(err);
    } else {
      result = rows;
      callback(result);
    }
  });
}

// 查询单个
function searchFromId(req, res, callback) {
  var param = req.query;
  console.log(param);
  var id = param.model_id;
  var result = {};
  db.queryArgs(sql.model_queryFromId, [id], function (err, rows) {
    if (err) {
      console.log("[SELECT ERROR]  - ", err.message);
      return callback(err);
    } else {
      result = rows;
      console.log("result");
      console.log(result);
      callback(result);
    }
  });
}


module.exports = {
  allCount: allCount,
  searchFromId: searchFromId,
  searchAll: searchAll,
  QueryAllShow: QueryAllShow,
  updatePosition: updatePosition,
  updateIsShow: updateIsShow,
};