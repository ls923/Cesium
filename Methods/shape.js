var sql = require("../Database/sql");
var db = require("../Database/DbConnection");
var temp_position;
var array;
//临时存储 position
function savePositions(req, res, callback) {
  // temp_position = JSON.stringify(req.body);
  temp_position = req.body;
  console.log(temp_position);
  array = temp_position.p;
  console.log("array");
  console.log(array);
  callback(array);
}

//获取 position
function getPositions(req, res, callback) {
  var param = req.query;
  var id = param.delete_id;
  db.queryArgs(sql.object_getPositions, [id], function (err, result) {
    if (err) {
      console.log("[Search ERROR] -", err.message);
      return err;
    } else {
      return callback(result);
    }
  });
}

// count
function allCount(req, res, callback) {
  db.query(sql.object_allCount, function (err, rows) {
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
  db.queryArgs(sql.object_queryAll, [num1, num2], function (err, rows) {
    if (err) {
      console.log("[SELECT ERROR]  - ", err.message);
      return callback(err);
    } else {
      result = {
        status: 0,
        msg: "QueryAll Shape Success",
        total: "",
        data: rows,
      };
      callback(result);
    }
  });
}

function delete_item(req, res) {
  var param = req.query;
  var id = param.delete_id;
  db.queryArgs(sql.object_delete, [id], function (err, result) {
    if (err) {
      console.log("[DELETE ERROR] -", err.message);
      return err;
    } else {
      return "Delete Success";
    }
  });
}

//添加
function addShape(req, res, callback) {
  var param = req.body;
  var id = param.id;
  var name = param.name;
  var describe = param.describe;
  var type = param.type;
  var response = {
    id: id,
    name: name,
    describe: describe,
    positions: array,
    type: type,
  };
  console.log(response);
  db.queryArgs(
    sql.object_insert,
    [id, name, describe, array, type],
    function (err, result) {
      if (err) {
        console.log("[INSERT ERROR] - ", err.message);
        const status = 0;
        return callback(err, status);
      } else {
        console.log("INSERT ID:", result);
        temp_position = null;
        const status = 1;
        callback(result, status);
      }
      // db.doReturn(res, result);
    }
  );
}

module.exports = {
  allCount: allCount,
  searchAll: searchAll,
  addShape: addShape,
  getPositions: getPositions,
  savePositions: savePositions,
  delete_item: delete_item,
};