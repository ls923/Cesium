var webSQL = {
  object_insert: "insert into object_info(object_id,object_name,object_describe,object_points,object_type) VALUES(?,?,?,?,?)",
  object_queryAll: "SELECT id,object_id,object_name,object_describe,object_type FROM object_info limit ?, ?",
  object_queryFromId: "SELECT * FROM object_info WHERE object_name= ? ",
  object_delete: "DELETE FROM object_info WHERE object_id= ? ",
  object_getPositions: 'SELECT object_points FROM object_info where object_id = ?',
  object_allCount: "select count(*) from object_info ;",
  model_queryAll: "SELECT * FROM model_info limit ?, ? ; ",
  model_queryAllShow: "SELECT * FROM model_info where isShow = 1 ; ",
  model_insert: "insert into model_info(model_id,model_name,model_position,model_url) VALUES ( ?,?,?,? ) ",
  model_queryFromId: "SELECT * FROM model_info WHERE model_id= ?",
  model_updataIsShow: " update model_info set isShow = ?  where model_id= ?",
  model_allCount: " select count(*) from model_info ; ",
  model_updatePosition: " update model_info set model_position = '{\"matrix\": [ ? ]}' where model_id= ?",
};

module.exports = webSQL;