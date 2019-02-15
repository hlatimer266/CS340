var express = require("express");
                  
var app = express();
var handlebars = require("express-handlebars").create({defaultLayout: "main"});
var request = require('request');
var bodyParser = require("body-parser");
var helpers = require('handlebars-helpers')();


app.use(bodyParser.urlencoded({ extended: false}));
app.use(express.static(__dirname + '/public'));

app.engine('handlebars',handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port',62619);

var mysql = require('mysql');
var pool = mysql.createPool({
  host  : 'classmysql.engr.oregonstate.edu',
  user  : 'cs290_latimerh',
  password: 'Chickens-123',
  database: 'cs290_latimerh'
});

var con = mysql.createConnection({
  host: 'classmysql.engr.oregonstate.edu',
  user: 'cs290_latimerh',
  password: 'Chickens-123'
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

app.get('/reset-table',function(req,res,next){
  var context = {};
  pool.query("DROP TABLE IF EXISTS workouts", function(err){ //replace your connection pool with the your variable containing the connection pool
    var createString = "CREATE TABLE workouts("+
    "id INT PRIMARY KEY AUTO_INCREMENT,"+
    "name VARCHAR(255) NOT NULL,"+
    "reps INT,"+
    "weight INT,"+
    "date DATE,"+
    "lbs BOOLEAN)";
    pool.query(createString, function(err){
      context.results = "Table reset";
      res.render('home',context);
    })
  });
});

app.post('/insert',function(req,res,next){
  var context = {};
  console.log("body: %j", req.body)
    if(req.body.name != '' ){
      pool.query("INSERT INTO workouts (`name`,`reps`,`weight`, `date`, `lbs`) VALUES (?,?,?,?,?)",
      [req.body.name, req.body.reps, req.body.weight, req.body.date, req.body.lbs], function(err, result){
        if(err){
          next(err);
          return;
        }
        res.render('home',context);
  });
}else {
  console.log("is empty");
}
});

app.get('/',function(req,res,next){
  var context = {};
  pool.query('SELECT * FROM workouts', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    context.results = rows;
    console.log(context.results);
    res.render('home', context);
  });
});

app.get('/updatedTable',function(req,res,next){
  var context = {};
  pool.query('SELECT * FROM workouts', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    context.results = rows;
    console.log(context.results);
    res.send(context);
  });
});


app.get('/update',function(req,res,next){
  var context = {};
  pool.query("SELECT * FROM workouts WHERE id=?", [req.query.id], function(err, result){
    if(err){
      next(err);
      return;
    }
    context.result = result; 
    res.render('update',context);
  });
});

app.get('/safe-update',function(req,res,next){
  var context = {};
  pool.query("SELECT * FROM workouts WHERE id=?", [req.query.id], function(err, result){
    console.log("in the safe update");
    if(err){
      next(err);
      return;
    }
    if(result.length == 1){
      pool.query("UPDATE workouts SET name=?, reps=?, weight=?, date=?, lbs=? WHERE id=? ",
        [req.query.name, req.query.reps, req.query.weight ,req.query.date,req.query.lbs ,req.query.id],
        function(err, result){
        if(err){
          next(err);
          return;
        }
        res.render('home');
      });
    }
  });
});

app.get('/delete',function(req,res,nest){
  pool.query("delete from workouts where id=?", [req.query.id], function(err,result){
    console.log("in the delete function");
  if(err){
    next(err);
    return;
  }
  });
});


app.listen(app.get('port'), function(){
  console.log('Express started on http://flip3.engr.oregonstate.edu:' + app.get('port') + '; press Ctrl-C to terminate.');
});