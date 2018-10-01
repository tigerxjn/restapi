var express = require('express')
var bodyParser = require('body-parser')
var mongoose=require('mongoose')
var app=express();
var email=require('emailjs/email');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('./config'); // get our config file
app.use(bodyParser.urlencoded({ extended: false }));

app.set('port',3300);
app.use(bodyParser.json());
app.use(function (req, res, next) {
app.set('superSecret', config.secret); // secret variable

  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});
var dbHost='mongodb://localhost:27017/lab';
mongoose.connect(dbHost);

var labSchema = mongoose.Schema({
    Category:String,
    FoodName:String,
    Restraunt:String,
    Happy:String
});

var userSchema=mongoose.Schema({
    UserName:String,
    Password:String,
    Email:String,
    Valid:Boolean
})

var Lab = mongoose.model('Lab', labSchema);
mongoose.connection;

var User=mongoose.model('User',userSchema)

app.listen(app.get('port'), function(){
      console.log('Server up: http://localhost:' + app.get('port'));
    });


app.post("/lab",function(req,res){
  console.log("Adding new lab:"+ req.body.LabName);
     var lab=new Lab ({
      Category : req.body.Category,
      FoodName : req.body.FoodName,
      Restraunt : req.body.Restraunt,
      Happy : req.body.Happy
     });

     lab.save(function(err, result){
      if (err) throw err;
      res.json({
        messaage:"Successfully added lab",
        lab:result

      });
     });
    });

app.post("/userlogin",function(req,res){
    var user=new User ({
        UserName:req.body.UserName,
        Password:req.body.Password,

      });
     User.findOne({UserName:user.UserName,Password:user.Password}).
     then(d=>{
      if(!d){
        return res.status(404).send({messaage:"Invalid user"})
      }
         console.log(user.UserName);
         console.log(d)
         const payload = {
          admin: user.Valid
        };
            var token = jwt.sign(payload, app.get('superSecret'), {
              expiresIn: '5h' // expires in 24 hours
            });

         res.json({
          username:user.UserName,
          token: token
        });
     })

})



    app.post("/user",function(req,res){
        console.log("Adding new user:"+ req.body.LabName);
           var user=new User ({
             UserName:req.body.UserName,
             Password:req.body.Password,
             Email:req.body.Email,
             Valid:false
           });

           user.save()
            .then(data=>{
               res.send(data);

               var emailname="xujianing30@gmail.com";
               var emailpass="19900502x"
               var veri="http://localhost:4200/veri/";

               var server= email.server.connect({
                   user:emailname,
                   password:emailpass,
                   host: "smtp.gmail.com",
                   ssl:true
               });
            server.send({
                text: "hello" + data.UserName,
                from: emailname,

                to: "xujianing300@gmail.com",
                cc:"a",
                subject:"hi"},function(err,messaage){console.log( err || messaage)})
            })
        })



app.get('/user',function(req,res){
    User.find({}, function(err, result){
      if ( err ) throw err;
      res.json(result);

    });
});
app.get('/lab',function(req,res){
  Lab.find({}, function(err, result){
    if ( err ) throw err;
    res.json(result);

  });
});
app.get('/user/:UserName',function(req,res){
    console.log("Fetching details for book with TaskName: " + req.params.UserName);
    User.findOne({UserName:req.params.UserName},function(err,result){
      if (err) throw err;
      res.json(result);
    });
  })
app.get('/lab/:LabName',function(req,res){
  console.log("Fetching details for book with TaskName: " + req.params.LabName);
  Lab.findOne({LabName:req.params.LabName},function(err,result){
    if (err) throw err;
    res.json(result);
  });
})


 app.put('/lab/:LabName', function(req, res){
    Lab.findOne({LabName:req.params.LabName},function(err,result){
      if(err) throw err;
      if(!result){
        res.json({
          message:"lab with labname: " + req.params.LabName+" not found.",
        });
      }
      result.LabCategory= req.body.LabCategory;
      result.LabName=req.body.LabName;
      result.Status=req.body.Status;

      result.save(function(err, result){
        if ( err ) throw err;
        res.json({
          message:"Successfully updated the lab",
          lab: result
        });
      });
    });
  });


  app.delete("/lab/:LabName", function(req, res){
    Lab.findOneAndRemove({LabName: req.params.LabName}, function(err, result){
      if ( err ) throw err;
      res.json({

        message: "Successfully deleted the book"+ req.params.lab,
        lab: result
      });
    });
  });


