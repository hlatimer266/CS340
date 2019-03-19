var express = require("express");
                  
var app = express();
var handlebars = require("express-handlebars").create({defaultLayout: "main"});
var request = require('request');
var bodyParser = require("body-parser");
var helpers = require('handlebars-helpers')();


// app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
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

app.get('/',function(req,res,next){
  var context = {};
  pool.query('SELECT first_name, last_name from persons;', function(err,rows,fields){
    if(err){
      next(err);
      return;
    }
    context.results = rows;
    res.render('home',context);
  });
});

app.get('/p_records',function(req,res,next){
  var context = {};
  console.log("body: %j", req.query);
  pool.query('SELECT first_name, last_name from persons;', (err,rows1,fields) => {
    if(err){
      next(err);
      return;
    }
       pool.query('SELECT  p.first_name, p.last_name, p.weight,p.height, e.workout,e.muscle_group, wl.reps, wl.exercised_at, wl.workout_id,wl.exercised_at FROM persons p \
      INNER JOIN workout_log wl ON p.id = wl.person_id \
      INNER JOIN exercise e ON wl.exercise_id = e.id \
      WHERE p.first_name = ? and p.last_name = ?;',[req.query.first_name, req.query.last_name], (err, rows, fields) => {
      if(err){
        next(err);
        return;
      }

         pool.query('SELECT  fc.id, p.first_name, p.last_name, fs.food_desc,fs.calories,fc.qty,fc.eaten_at FROM persons p \
        INNER JOIN food_consumption fc ON p.id = fc.p_id \
        INNER JOIN food_selection fs ON fc.f_id = fs.id \
        WHERE p.first_name = ? and p.last_name = ?;',[req.query.first_name, req.query.last_name], (err, rows2, fields) => {
        if(err){
          next(err);
          return;
        }
        context.wo_results = rows;
        context.results = rows1;
        context.fc_results = rows2;
        res.render('home', context);

      });

   
  });
    
  });

});

app.get('/deletewol',function(req,res,nest){
  console.log(req.query.id);
  pool.query("delete from workout_log where workout_id=?", [req.query.id], function(err,result){
    console.log("in the delete function");
  if(err){
    next(err);
    return;
  }
  });
});

app.post('/insert_person',function(req,res,next){
  var context = {};
  console.log("insert person");
  
  //console.log("body: %j", req.body);
  console.log(req.body.first_name);
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
      pool.query("INSERT INTO `exercise`(workout,muscle_group) VALUES (?,?);",
      [req.body.workout, req.body.muscle_group], function(err, result){
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

app.post('/insert_food',function(req,res,next){
  var context = {};
  console.log("body: %j", req.body)
    if(req.body.workout != '' ){
      pool.query("INSERT INTO `food_selection`(food_desc,calories) VALUES (?,?);",
      [req.body.food_desc, req.body.calories], function(err, result){
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


app.get('/workoutlog',function(req,res,next){
  var context = {};
  pool.query('SELECT  p.first_name, p.last_name, p.weight, e.workout,e.muscle_group, wl.reps, wl.exercised_at, wl.workout_id FROM persons p \
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

  
});

app.get('/update_wo', function(req,res,next){
  var context = {};
  console.log(req.query.workout_id);
  pool.query('SELECT  p.first_name, p.last_name, e.workout, e.muscle_group, wl.reps, wl.exercised_at, wl.workout_id FROM persons p \
    INNER JOIN workout_log wl ON p.id = wl.person_id \
    INNER JOIN exercise e ON wl.exercise_id = e.id \
    WHERE wl.workout_id = ?', [req.query.workout_id], (err, rows, fields) => {
    if(err){
      next(err);
      return;
    }
      pool.query('SELECT workout FROM exercise', function(err, rows2, fields) {
        if(err){
          next(err);
          return;
        }
          context.results = rows;
          context.exercise = rows2;
          console.log(context);
          res.render('update_wo',context);
          });
    
    });

});

app.get('/update_wol',function(req,res,next){
  console.log("query: %j", req.query);
  var name = {}
  pool.query('UPDATE workout_log SET reps = ?, exercised_at = ? WHERE workout_id = ?',[req.query.reps,req.query.e_at,req.query.wid],function(err,result){
      if(err){
          next(err);
          return;
        }
        res.render('home');
    })
});


app.get('/insert_wo',function(req,res,next){
  var context = {};
  console.log("query: %j", req.query);
  pool.query("INSERT INTO workout_log (person_id, exercise_id,reps, exercised_at) Values \
    ((select id from persons where first_name=? and last_name=?), \
    (select id from exercise where workout=?),?, ?);", [req.query.first_name,req.query.last_name,req.query.exercise,req.query.reps,req.query.date], function(err, result){
    
    if(err){
      next(err);
      return;
    }
    res.render('workoutlog');
  });
});

app.get('/foodlog',function(req,res,next){
  var context = {};
  pool.query('SELECT fc.id,p.first_name, p.last_name, fs.food_desc, fs.calories,fc.qty, fc.eaten_at \
              from persons p\
              INNER JOIN food_consumption fc\
              ON p.id = fc.p_id \
              INNER JOIN food_selection fs \
              ON fc.f_id = fs.id \
              WHERE fc.id = ?',[req.query.id], (err, rows, fields) => {
    if(err){
      next(err);
      return;
    } 

        context.fc_results = rows;
        res.render('foodlog', context);
        })
   
    });


app.get('/foodentry',function(req,res,next){
  var context = {};
  
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
        context.selection = rows2;
        context.people = rows3;
        console.log(context.people);
        res.render('foodentry', context);
        })
   
    });
  
});

app.get('/insert_fl',function(req,res,next){
  var context = {};
  console.log("query: %j", req.query);
  pool.query("INSERT INTO food_consumption (p_id,f_id,qty,eaten_at) Values \
    ((select id from persons where first_name=? and last_name=?),\
    (select id from food_selection where food_desc=?),?,? \
    );", [req.query.first_name,req.query.last_name,req.query.food_desc,req.query.qty,req.query.date], function(err, result){
    
    if(err){
      next(err);
      return;
    }
    res.render('home');
  });
});

app.get('/update_fl',function(req,res,next){
  console.log("query: %j", req.query);
  var name = {}
  pool.query('UPDATE food_consumption SET qty=?, eaten_at=?  WHERE id = ?',[req.query.qty,req.query.date,req.query.id],function(err,result){
      if(err){
          next(err);
          return;
        }
        res.render('home');
    })
});

app.get('/deletefl',function(req,res,nest){
  console.log(req.query.id);
  pool.query("delete from food_consumption where id=?", [req.query.id], function(err,result){
    console.log("in the delete function");
  if(err){
    next(err);
    return;
  }
  });
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});