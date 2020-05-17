var mysql = require('mysql');
var DBConfig = require('./DBConfig');
var pool = mysql.createPool(DBConfig.mysql);

//返回json
function resDoReturn (res,ret) {
    if (typeof ret === 'undefined'){
        res.json({
            code:'-1',
            msg:'Err'
        });
    }else{
        res.json(ret);
    }
}

 // 封装query之sql带不占位符func
function query(sql, callback) {
    pool.getConnection(function (err, connection) {
        if(err){
            callback(err,null);
        }else{
            connection.query(sql, function (err, rows) {
                connection.release();
                callback(err, rows);
                //释放链接
            });
        }
    });
}

 // 封装query之sql带占位符func
function queryArgs(sql,args, callback) {
    pool.getConnection(function (err, connection) {
        if(err){
            callback(err,null,null);
        }else{
            connection.query(sql, args,function (err, rows) {
                connection.release();
                callback(err, rows);
                //释放链接
            });
        }
    });
}

module.exports={
    query:query,
    queryArgs:queryArgs,
    doReturn:resDoReturn
};