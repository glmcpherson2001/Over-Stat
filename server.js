const ejs = require('ejs');
const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const crypto = require('crypto');
const app = express();
const router = express.Router();
const AWS = require('aws-sdk');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

const mysql = require('mysql');
const { get } = require('http');

const connection = mysql.createConnection({
  host     : 'awseb-e-ctbcnicmgw-stack-awsebrdsdatabase-ubpeo1yl4otc.cattbtvevbxg.us-east-1.rds.amazonaws.com',
  user     : 'overstat',
  password : 'Computershit198',
  database : 'ebdb',
  port: 3306
});

/* function getData(username = '', role, row, callback) {
  let query;
  if (username.length === 0) {
    query = `SELECT DATE_FORMAT(match_time, '%H:00') as Hour, AVG(win_loss = 'W') as Win_Rate FROM user_data WHERE player_role = '${role}' GROUP BY EXTRACT(HOUR FROM match_time), player_role ORDER BY AVG(win_loss = 'W') DESC LIMIT 3;`;
  } else {
    query = `SELECT DATE_FORMAT(match_time, '%H:00') as Hour, AVG(win_loss = 'W') as Win_Rate FROM user_data WHERE username = '${username}' AND player_role = '${role}' GROUP BY EXTRACT(HOUR FROM match_time), player_role ORDER BY AVG(win_loss = 'W') DESC LIMIT 3;`;
  }
  connection.query(query, (error, results, fields) => {
    if (error) {
      callback('Cannot get data at the moment', null);
    } else if (results.length > 0) {
      const result = results[row - 1];
      const data = { Hour: result.Hour, Win_Rate: result.Win_Rate };
      callback(null, data);
    } else {
      callback('No results found', null);
    }
  });


} */

function getData(username = '', role) {
  let query;
  if (username.length === 0) {
    query = `SELECT DATE_FORMAT(match_time, '%H:00') as Hour, AVG(win_loss = 'W') as Win_Rate FROM user_data WHERE player_role = '${role}' GROUP BY EXTRACT(HOUR FROM match_time), player_role ORDER BY AVG(win_loss = 'W') DESC LIMIT 3;`;
  } else {
    query = `SELECT DATE_FORMAT(match_time, '%H:00') as Hour, AVG(win_loss = 'W') as Win_Rate FROM user_data WHERE username = '${username}' AND player_role = '${role}' GROUP BY EXTRACT(HOUR FROM match_time), player_role ORDER BY AVG(win_loss = 'W') DESC LIMIT 3;`;
  }

  return new Promise((resolve, reject) => {
    connection.query(query, (error, results, fields) => {
      if (error) {
        resolve('Cannot get data at the moment');
      } else if (results.length > 0) {
        resolve(results);
      } else {
        resolve('No results found');
      }
    });
  });
}







app.use(session({
  secret: 'mysecretkey',
  resave: false,
  saveUninitialized: false
}));


// Authentication

const poolData = {
  UserPoolId: 'us-east-1_kuKAn64nq',
  ClientId: '3mauvrb7a0951popnppfnvaplf'
};

const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

// Sign up function
function signUp(username, password, email, callback) {
  const attributeList = [
    new AmazonCognitoIdentity.CognitoUserAttribute({ Name: 'email', Value: email })
  ];

  userPool.signUp(username, password, attributeList, null, function(err, result) {
    if (err) {
      console.log(err);
      return callback(err);
    }

    const cognitoUser = result.user;
    console.log('User registration successful: ' + cognitoUser.getUsername());

    return callback(null, cognitoUser);
  });
}

// Sign in function
function signIn(username, password, callback) {
  const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
    Username: username,
    Password: password,
  });

  const cognitoUser = new AmazonCognitoIdentity.CognitoUser({
    Username: username,
    Pool: userPool
  });

  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function(result) {
      console.log('Access token: ' + result.getAccessToken().getJwtToken());
      return callback(null, result.getAccessToken().getJwtToken());
    },
    onFailure: function(err) {
      console.log(err);
      return callback(err);
    }
  });
}

function confirmUser(username ,confirmationCode, callback) {

  const userData = {
    Username: username,
    Pool: userPool
  };

  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  cognitoUser.confirmRegistration(confirmationCode, true, function(err, result) {
    if (err) {
      console.log(err);
      return callback(err);
    }

    console.log('User confirmation successful: ' + cognitoUser.getUsername());

    return callback(null, result);
  });
}


app.use(express.static('views'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

function getRoute(routePath, requireLogin, callback) {
  router.get('/'+(routePath), (req, res) => {
    let currentUser;
    let data = {};
    
    // Check if there's a current user session
    if(req.session){
      currentUser = req.session.currentUser;
      data.currentUser = currentUser;
    }

    // Check if login is required and user is logged in
    if((requireLogin && !currentUser)){
      // Store the original URL in the session
      req.session.originalUrl = req.originalUrl;
      res.render('login');
    } else {
      // If the user is logged in, clear the original URL stored in the session
      req.session.originalUrl = null;
      // Check if a callback function was passed
      if (callback) {
        // Call the callback function to define data to be passed to the function
        callback(data)
      }
      res.render(routePath, data);
    } 
  });
}

getRoute('your_data', true, function(data){

  var username = data.currentUser;

  getData(username, 'T')

  .then(Hour => {
   tankWinRate = Hour[0].Hour;
   console.log(Hour);
    console.log('Tank Ran');
    return getData(username, 'D', 1);
  })

  .then(Hour=> {
    damageWinRate = Hour[0].Hour;
    console.log('Damage Ran');
    return getData(username, 'S', 1);
  })

  .then(Hour => {
   supportWinRate = Hour[0].Hour;
   
   console.log('Support Ran');
  })

  .catch(error => {
    console.error(`error: ${error}`);
  });

  data.tankWinRate = tankWinRate;
  data.damageWinRate = damageWinRate;
  data.supportWinRate = supportWinRate;
  console.log(data);

});

getRoute('', false, function(data){

  var username = '';

  getData(username, 'T')

  .then(Hour => {
   tankWinRate = Hour[0].Hour;
   console.log(Hour);
    console.log('Tank Ran');
    return getData(username, 'D', 1);
  })

  .then(Hour=> {
    damageWinRate = Hour[0].Hour;
    console.log('Damage Ran');
    return getData(username, 'S', 1);
  })

  .then(Hour => {
   supportWinRate = Hour[0].Hour;
   
   console.log('Support Ran');
  })

  .catch(error => {
    console.error(`error: ${error}`);
  });

  data.tankWinRate = tankWinRate;
  data.damageWinRate = damageWinRate;
  data.supportWinRate = supportWinRate;
  console.log(data);

});

getRoute('about');

getRoute('enter_data');






// Mount the router on a sub-path of the main application
app.use('/', router);



// app.post functions

app.post('/signin', function(req, res) {
  // Get the username and password from the request body
  var username = req.body.username;
  
  var password = req.body.password;


  signIn(username, password, function(err){
    if(err){
      res.status(401).send('Sign-in unsuccessful');
      console.log(err);
    } else{
       // If authentication is successful, set the user session variable
      req.session.currentUser = { username: username };

      // Return a success response
      if(req.session.originalUrl) {
        res.redirect(req.session.originalUrl);
      } else {
        // If there is no original URL stored in the session, redirect the user to the home page
        res.redirect('/');
      }
    }
  })

 
});


app.post('/upload_data', function(req, res) {
  var formData = req.body.formData;
  var username = req.session.currentUser.username;

  for (var i = 1; i <= Object.keys(formData).length; i++) {
    var role = formData["match-" + i].role;
    var time = formData["match-" + i].time;
    var winLoss = formData["match-" + i].winLoss;

    connection.query('INSERT INTO user_data (username, match_time, player_role, win_loss) VALUES (?, ?, ?, ?)', [username, time, role, winLoss], function(error, results, fields) {
      if (error) throw error;
      console.log(username + " Inserted data into database");
    });
  }
  res.redirect('your_data');
});



app.post('/signup', function(req, res) {
  // Get the username and password from the request body
  var username = req.body.username;
  
  var password = req.body.password;

  var email = req.body.email;


  signUp(username, password, email, function(err){
    if(err){
      res.status(401).send('Sign-Up unsuccessful');
      console.log(err);
    } else{
       // If authentication is successful, set the user session variable
      req.session.currentUser = { username: username };

      // Return a success response
      res.redirect('/confirmation');
    }
  })

 
});

app.post('/confirmation', function(req, res) {
  // Get the username and password from the request body
    var username = req.session.currentUser.username;
    var confirmationCode = req.body.con_num;
  


  confirmUser(username, confirmationCode, function(err){
    if(err){
      res.status(401).send('Confirmation unsuccessful');
      console.log(err);
    } else{

      // Return a success response
      res.redirect('/')
    }
  })

 
});

app.get('/signout', function(req, res) {
  // Remove the currentUser object from the session
  req.session.currentUser = null;

  // Redirect to the home page
  res.redirect('/');
});


const port = 8080;
const host = '127.0.0.1';



app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}/`);
});