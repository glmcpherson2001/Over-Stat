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


function getRoute(routePath, data) {
    router.get('/'+(routePath), (req, res) => {
      
      if(req.session){
        var currentUser = req.session.currentUser;

        // Initializes data object if not already
        if(!data){
          data = {}
        }
          data.currentUser = currentUser;
      }
        res.render(routePath, data); 
        
    });
    console.log(routePath+"was requested")
    
}

getRoute('', {
    damageWinRate : '2:00pm',
    tankWinRate : '1:00pm',
    supportWinRate :'3:00am'
    }
);

getRoute('enter_data');

getRoute('your_data');

getRoute('about');

getRoute('login');

getRoute('confirmation');

getRoute('signup');


// Mount the router on a sub-path of the main application
app.use('/', router);


app.use('enter_data', router);


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
      res.redirect('/');
    }
  })

 
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

  // Redirect to the login page
  res.redirect('/');
});


const port = 8080;
const host = '127.0.0.1';



app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}/`);
});