/**
 * Created by Administrator on 2017/6/2 0002.
 */
//这个模块里面封装了所有对数据库的常用操作
var MongoClient = require("mongodb").MongoClient;
var setting = require("../setting.js");

//连接数据库(封装成内部函数)：
function _connectDB(callback){
    var url = setting.dburl;
    MongoClient.connect(url,function(err,db){
        if(err){
            callback(err,null);
            return;
        }
        callback(err,db);
    });
}

//插入数据
exports.insertOne = function(collectionName, json ,callback){
    _connectDB(function(err,db){
        db.collection(collectionName).insertOne(json,function(err,result){
            //插入数据后要做的事：
            callback(err,result);
            db.close(); //关闭数据库
        });
    });
};

//查找数据: args是个对象{"pageamount":5,"page":10}
exports.find = function(collectionName,json,C,D){
    var result = []; //结果数组

    if(arguments.length == 3){
        //那么参数C就是callback，参数D没有传
        var callback = C;
        var skipnumber = 0;  //应该略过的条数
        var limit = 0; //每页显示的条数（限制数目）
    }else if(arguments.length == 4){
        var args = C;
        var callback = D;
        var skipnumber = args.pageamount * args.page || 0;  //应该略过的条数
        var limit = args.pageamount || 0; //每页显示的条数（限制数目）
        var sort = args.sort || {}; //排序方式
    }else{
        throw new Error("find函数的参数个数是3个或者4个");
        return;
    }

    //连接数据库，连接之后查找所有
    _connectDB(function(err,db){
        if(err){
            callback(err,null);
            return;
        }
        var cursor = db.collection(collectionName).find(json).limit(limit).skip(skipnumber).sort(sort);
        cursor.each(function(err,doc){
            if(err){
                callback(err,null);
                return;
            }
            if(doc != null){
                result.push(doc); //把结果放入数组
            }else{
                //遍历结束，就调用回调函数
                callback(null,result);
            }
        });
    });
};

//删除
exports.deleteMany = function (collectionName, json, callback) {
    _connectDB(function (err, db) {
        //删除
        db.collection(collectionName).deleteMany(
            json,
            function (err, results) {
                callback(err, results);
                db.close(); //关闭数据库
            }
        );
    });
};


//修改
exports.updateMany = function (collectionName, json1, json2, callback) {
    _connectDB(function (err, db) {
        db.collection(collectionName).updateMany(
            json1,
            json2,
            function (err, results) {
                callback(err, results);
                db.close();
            });
    })
};


exports.getAllCount = function (collectionName,callback) {
    _connectDB(function (err, db) {
        db.collection(collectionName).count({}).then(function(count) {
            callback(count);
            db.close();
        });
    })
};

