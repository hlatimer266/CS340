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
  user  : 'cs340_latimerh',
  password: '6395',
  database: 'cs340_latimerh'
});

var con = mysql.createConnection({
  host: 'classmysql.engr.oregonstate.edu',
  user: 'cs340_latimerh',
  password: '6395'
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

app.post('/insert_person',function(req,res,next){
  var context = {};
  console.log("insert person");
  console.log("body: %j", req.body);
    if(req.body.first_name != '' ){
      pool.query("INSERT INTO `persons`(first_name,last_name,height,weight) VALUES (?,?, ?,?)",
      [req.body.first_name, req.body.last_name, req.body.height, req.body.weight], function(err, result){
        if(err){
          next(err);
          return;
        }
         res.render('home');
  });
}else {
  console.log("is empty");
}
});

app.post('/insert_exercise',function(req,res,next){
  var context = {};
  console.log("body: %j", req.body)
    if(req.body.workout != '' ){
      pool.query("INSERT INTO `exercise`(workout,reps,muscle_group) VALUES (?,?,?);",
      [req.body.workout, req.body.reps, req.body.muscle_group], function(err, result){
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
  pool.query('SELECT  p.first_name, p.last_name, p.weight, e.workout, e.reps, wl.exercised_at, wl.workout_id FROM persons p \
    INNER JOIN workout_log wl ON p.id = wl.person_id \
    INNER JOIN exercise e ON wl.exercise_id = e.id', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }

    context.results = rows;
    console.log(context.results);
    res.render('home', context);
  });

});


app.get('/workoutlog',async function(req,res,next){
  var context = {};
  pool.query('SELECT  p.first_name, p.last_name, p.weight, e.workout, e.reps, wl.exercised_at FROM persons p \
    INNER JOIN workout_log wl ON p.id = wl.person_id \
    INNER JOIN exercise e ON wl.exercise_id = e.id', (err, rows, fields) => {
    if(err){
      next(err);
      return;
    } 

      pool.query('SELECT workout FROM exercise', (err, rows2, fields) => {
      if(err){
        next(err);
        return;
      }
      
        pool.query('SELECT first_name,last_name FROM persons',function(err,rows3,fields){
          if(err){
            next(err);
            return
          }
        context.results = rows;
        context.exercises = rows2;
        context.people = rows3;
        console.log(context.people);
        res.render('workoutlog', context);
        })
   
    });

    
  });

context.results = rows;
      context.exercises = rows2;
      console.log(context.exercises);
      res.render('workoutlog', context);
  
});
  

app.get('/insert_wo',function(req,res,next){
  var context = {};
  console.log("query: %j", req.query);
  pool.query("INSERT INTO workout_log (person_id, exercise_id, exercised_at) Values \
    ((select id from persons where first_name=? and last_name=?), \
    (select id from exercise where workout=?), current_time);", [req.query.first_name,req.query.last_name,req.query.exercise], function(err, result){
    
    if(err){
      next(err);
      return;
    }
    res.render('workoutlog');
  });
});

app.get('/foodlog',async function(req,res,next){
  var context = {};
  pool.query('SELECT p.first_name, p.last_name, fs.food_desc, fs.calories, fc.eaten_at \
              from persons p\
              INNER JOIN food_consumption fc\
              ON p.id = fc.p_id \
              INNER JOIN food_selection fs \
              ON fc.f_id = fs.id', (err, rows, fields) => {
    if(err){
      next(err);
      return;
    } 

      pool.query('SELECT food_desc FROM food_selection', (err, rows2, fields) => {
      if(err){
        next(err);
        return;
      }
      
        pool.query('SELECT first_name,last_name FROM persons',function(err,rows3,fields){
          if(err){
            next(err);
            return
          }
        context.results = rows;
        context.selection = rows2;
        context.people = rows3;
        console.log(context.selection);
        res.render('foodlog', context);
        })
   
    });

    
  });

      context.results = rows;
      context.exercises = rows2;
      console.log(context.exercises);
      res.render('workoutlog', context);
  
});

app.get('/insert_fl',function(req,res,next){
  var context = {};
  console.log("query: %j", req.query);
  pool.query("INSERT INTO food_consumption (f_id,eaten_at, p_id) Values \
    ((select id from food_selection where food_desc=?),current_time, \
    (select id from persons where first_name=? and last_name=?));", [req.query.food_desc,req.query.first_name,req.query.last_name], function(err, result){
    
    if(err){
      next(err);
      return;
    }
    res.render('foodlog');
  });
});

app.get('/delete_wo',function(req,res,next){
  console.log(req.query.id)
  pool.query("delete from workout_log where workout_id=?", [req.query.id], function(err,result){
    console.log("in the delete function");
  if(err){
    next(err);
    return;
  }
  res.render('home');
  });
});


app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});