const ejs = require('ejs');
const express = require('express');
const path = require('path');
const fs = require('fs');
const Amplify = require('aws-amplify');

const Auth = Amplify.Amplify.Auth;
const app = express();
const router = express.Router();

Amplify.Amplify.configure({
    Auth:{
        region: 'us-east-1',
        userPoolId: 'us-east-1_Qfm3szDxe',
        userPoolWebClientId: '2k0rrq6aompii0mgelaf8fthat'
    }
});

// Sign up function
async function signUp(username, password, email) {
    try {
      const result = await Amplify.Auth.signUp({
        username,
        password,
        attributes: {
          email,
        },
      });
      console.log('Sign up successful:', result);
      return result;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };


// Sign in function
async function signIn(username, password) {
    try {
      const result = await Amplify.Auth.signIn(username, password);
      console.log('Sign in successful:', result);
      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }
  


app.use(express.static('views'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


function getRoute(routePath, data) {
    router.get('/'+(routePath), (req, res) => {
        res.render(routePath, data); 
    });
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




// Mount the router on a sub-path of the main application
app.use('/', router);


app.use('enter_data', router);



const port = 3000;

app.listen(port, () => {
    console.log('Server started on port 8080');
});