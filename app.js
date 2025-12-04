// create server 
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
require('dotenv').config();  // load env variables




const app = express();

const cors = require('cors') ;
app.use(cors({
  origin: process.env.CLIENT_URL ,
  credentials: true,  // allow credentials cookies from frontend to backend
}));

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));



const connectDB = require('./src/db/db') ;
connectDB();


const authRouter = require('./src/routes/auth.route') ;


app.use('/api/auth' , authRouter ) ;




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});









/*
api - waiters - communicate between 2 softwares\
rest = www architechture . client(http requests) server(json) , stateless
npm install <package_name>  install dependencies locally on node modules folder
npx - execute packages without installing globally

setup project

npm init -y                              # package json    for project metadata and dependencies
npm i express dotenv mongoose            # node modules    install thse package in node modules  library



create server  app.js
----------------------------------------------------------------------------------

const express = require('express');
const app = express();

require('dotenv').config(); # load env variables
const PORT = process.env.PORT || 3000;

const connectDB = require('./src/db/db');
connectDB();


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


----------------------------------------------------------------------------------
Database connection
----------------------------------------------------------------------------------
 mongodb atlas - cloud based
 create project  - create cluster  - connect -
 get  connection string( mongodb://<username><password>@cluster0.mongodb.net/<collection_name> )


  const mongoose  = require('mongoose') ;
  
  function  connectDB() {
    mongoose.connect( mongodb://localhost:27017/mydatabase )
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch((error) => {
      console.error('MongoDB connection error:', error);
    });
  
  }
  
  module.exports = connectDB;

----------------------------------------------
Running the server
----------------------------------------------------------------------------------


node server.js            # start server
npx nodemon server.js     # start + auto update  server

u could also change script In package.json add

 "scripts": {
    "start": "node app.js",   # for production npm start
    "dev": "nodemon app.js",    # for development npm run dev
  },
----------------------------------------------------------------------------------

src folder : models ,  routes and controllers

Model
        const mongoose = require('mongoose');
        
        const userSchema = new mongoose.Schema({
          fullName: { type: String, required: true },
          email: { type: String, required: true, unique: true },
          password: { type: String,  }, 
        }, 
        { timestamps: true }
        );
        
        const userModel = mongoose.model('user', userSchema);
        module.exports = userModel;


---------------------------------------------

Router

 This allows you to organize routes into separate files for better maintainability

        const express = require('express');
        const router = express.Router();

        router.get('/', (req, res) => {
          res.send('Users list');
        });

        router.get('/:id', (req, res) => {
          res.send(`User profile for ID: ${req.params.id}`);
        });

        module.exports = router;

__________________________________________________________________________________

       

        const usersRouter = require('./routes/users');

        app.use('/users', usersRouter); // Mount the users router at /users

        
____________________________________________________________________________________________________________________

      AUTHENTICATION  : verify user such that u dont have to repeatedly authenticate  
___________________________________________________________________________________________________________________



      BACKEND   Authentication   ( Stateless )
        
                 B   U   T         I  N             B  A  C  K  E  N  D
every api needs to verify user on each request anyhow  even after login/register
The backend server is stateless: it  does not  maintain & store  user credentials state  after login/register. 

u only make sure   there are no database lookups for each request.

so  API dont rely on  email + password  every time  
rather server on register/login give a token(signed on userId) to client
now API will get this token on request rather than email/password & server verifies this token
so there are no database lookups for each request. token could be verified & decoded using secret key


can use auth middlewares to verify token on each request


why token
- less db lookups
- frontend could store token rather than email/password for it statefull authentication
-SSO (Single Sign On) USE TOKEN TO login automatically if token setup

-------------------------------------------------------------------------------------------------------
FRONTEND : IT IS A PERSONAL INTERFACE FOR USERS   BASED  ON BACKEND 

first u make pages with dummy data
make globaluser state and protect route accordingly with that user state in app.jsx
backend(login signup logout) just give user as response 
on frontend ((login,signup,logout)) u update user state accordingly according to backend user response 

that how authentication works 


FRONTEND _ AUTHENTICATION ( Statefull )

frontend is statefull
after login/register   it maintains user state in global state(redux) such that user dont need to login again on every page change


STATE :  generally  it doesnt store Email /  Password rather it stores
 token + user info (name, email, userId) 

according to this state pages are protected / unprotected   + connect to backend




if u want to persist login after browser is closed  u can store token 
& u can run auto logic  on app load such that if token present in storage  then
make api call to backend to get user details   andn update state

U CAN STORE IN 3 WAYS:
1. local storage : permanent until manually cleared
2. session storage : persist data only until the browser tab is closed
both sent in headers manually  authorization: Bearer <token>
3. cookies : small pieces of data stored by the browser, can have expiration datesn
              and are  set  automatically
            & Cookies are included in every HTTP request
               (just  set withCredentials: true in axios/fetch)
               (& allow credentials in backend by cors)


cookies are more secure than local storage / session storage
because u can set httpOnly flag such that js on frontend cant access it  anyhow by code 
so it cant be stolen by xss attacks






cookie essentials  

res.cookie('token', token, { httpOnly: true }  ) ;     # sending cookie from backend to frontend
res.clearCookie('token');                              # clear cookie from backend
console.log( req.cookies.token )                       # read cookie from backend by helping cookie-parser middleware

      
*/


