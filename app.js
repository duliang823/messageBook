/**
 * Created by Administrator on 2017/6/3 0003.
 */
var express = require("express");
var app = express();
var db = require("./model/db.js");
var formidable = require("formidable");
var ObjectId = require("mongodb").ObjectID;

//设置模板引擎
app.set("view engine","ejs");

//静态
app.use(express.static("./public"));

//显示留言列表
app.get("/",function(req,res,next){
    db.getAllCount("liuyanben",function(count){
        res.render("index",{
            "pageamount" : Math.ceil(count / 4)  //向上取整
        });
    });
});

//读留言数据,这个页面是供ajax使用的
app.get("/du",function(req,res,next){
    //可以接收一个参数
    var page = parseInt(req.query.page); //当前的页数

    db.find("liuyanben",{},{"pageamount":4,"page":page,"sort":{"shijian":-1}},function(err,result){
        if(err){
            return;
            next();
        }
        res.json({"result":result});
    });
});


//处理留言
app.post("/tijiao", function (req,res,next) {
    var form = new formidable.IncomingForm();

    form.parse(req,function(err,fields){
        if(err){
            return;
            next();
        }
        //写入数据库
        db.insertOne("liuyanben", {
            "xingming" : fields.xingming,
            "liuyan" : fields.liuyan,
            "shijian" : new Date()
        }, function(err,result){
            if(err){
                res.json({"result":-1}); //给Ajax看的
                return;
            }
            res.json({"result":1}); //给Ajax看的
        });
    });
});

//删除
app.get("/shanchu",function (req,res,next){
    //得到参数
    var id = req.query.id;
    db.deleteMany("liuyanben",{"_id":ObjectId(id)},function(err,result){
        if(err){
            return;
            next();
        }
        res.redirect("/");
    });
});

//404
app.use(function(req,res){
    res.render("err");
});

app.listen(3000);
