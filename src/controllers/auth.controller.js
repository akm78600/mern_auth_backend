const userModel = require("../models/user.model");
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const {sendVerificationEmail, sendWelcomeEmail, sendResetPasswordMail, sendPasswordResetSuccessMail}= require("../mailtrap/mailtrap.config");
const crypto = require('crypto');




async function signupController( req , res ) {

    const { name, email, password } = req.body;

    if ( !name || !email || !password) {
        return res.status(400).json({ success:false , message: 'All fields are required' });
    }
    if ( password.length < 6 ) {
        return res.status(400).json({ success:false , message: 'Password must be at least 6 characters long' });
    }
    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            
                             return res.status(400).json({ success:false , message: 'Email is already registered' });

            

        }


        const hashPassword = await bcryptjs.hash(password, 10);
        const verificationToken= Math.floor(100000 + Math.random() * 900000).toString();

        await  sendVerificationEmail( email   , verificationToken);  // send verification email for token


        const newUser = new userModel({
            name,
            email,
            password: hashPassword ,
            verificationToken , 
        } ) ;
        await newUser.save();



        const token =  jwt.sign(   {email:newUser.email } , process.env.JWT_SECRET , { expiresIn:"7d" }  ) ;
        res.cookie( "token" , token , {
              httpOnly: true,    // prevent xss cross site scripting attack letting to use cookie not from client js only http
              secure: process.env.NODE_ENV ==="production",    //  for https
              sameSite:"strict",
              maxAge: 7 *24* 1000*60*60

        } )


        return res.status(201).json(
            { 
                success: true, 
                message: 'User registered successfully' ,
                user: {
                   ...newUser._doc,
                   password:undefined,
                    
                }
            }
        ) ;

    } catch (error) {
        console.log( 'error during signup:' , error);
        return res.status(500).json({ success:false ,  message: 'Internal server error' });
    }

   
}

async function verifyController(req, res){
    
    const { code } = req.body;

    try{

        const user = await userModel.findOne({
              verificationToken : code,
        })

        if( !user ){
               
            return res.status(400).json({
                 success: false,
                 message:"invalid  Code"
            });

        }
        user.isVerified=true;
        user.verificationToken=undefined;

        await user.save();

        await  sendWelcomeEmail( user.email   , user.name);  // send welcome email for token


        res.status(201).json({
            success:true,
            message:"User verified successfully",
            user:{
                ...user._doc,
                password:undefined,
            },
        });

    }
    catch( error ){

        res.status(500).json({
            success:false,
            message:"Internal server error",
        });
                    console.log( "error in verifying user" , error)


    }


}

async function loginController(req, res) {

       const {email ,password}= req.body;

       try{
             const user= await userModel.findOne({email});

             if(!user){
                return res.status(400).json({
                    success:false,
                    message:"invalid credentials",
                })
             }

             // Invalid Password

             const isPasswordValid = await bcryptjs.compare( password , user.password ) ;

             if( !isPasswordValid ) {

                 return res.status(400).json( {
                    success:false,
                    message:"invalid credentials",
                })

             }

            

             user.lastLogin = new Date();
             await user.save();



            const token =  jwt.sign(   {email:user.email } , process.env.JWT_SECRET , { expiresIn:"7d" }  ) ;
            res.cookie( "token" , token , {
              httpOnly: true,    // prevent xss cross site scripting attack letting to use cookie not from client js only http
              secure: process.env.NODE_ENV ==="production",    //  for https
              sameSite:"strict",
              maxAge: 7 *24* 1000*60*60
        } )


        return res.status(201).json(
            { 
                success: true, 
                message: 'User logged in  successfully' ,
                user: {
                   ...user._doc,
                   password:undefined,
                    
                }
            }
        );

       } 
       catch(error){
        console.log("error in login ",error);

        res.status(500).json({
            success:false,
            message:"internal server error"
        })

       }
}
async function logoutController(req, res) {
    // Logout logic to be implemented

    try{
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",           // make this explicit
            // domain: "localhost"  // add this if you ever set a domain explicitly
          });
                  
        res.status(200).json( 
            {
                success:true ,
                message:"logged out successfully"
            } 
        )
    }
    catch(error){
        console.log("error in logout ",error);
        res.status(500).json({
            success:false,
            message:"internal server error"
        })
    }
}

async function forgotPasswordController(req,res){

    // just send a reset password email to the email

    const {email} = req.body;

    try{
  
         const user  = await userModel.findOne( { email } ) ;
           if( !user ){
                return res.status(400).json({

                    success:false,
                    message:"Invalid Email" ,

                })
             }

             const resetPasswordToken= crypto.randomBytes(20).toString("hex");  // generate 20 digit token
             const resetPasswordTokenExpiresAt= Date.now()+ 60*60*1000;  // 1 Hour

             user.resetPasswordToken=resetPasswordToken;
             user.resetPasswordTokenExpiresAt=resetPasswordTokenExpiresAt;
             await user.save();

        await  sendResetPasswordMail( user.email  , `${process.env.CLIENT_URL}/reset-password/${resetPasswordToken}` ) ;

        res.status(201).json({
            success:true,
            message:"Reset password email sent successfully"
        })

    }
    catch( error ){


        console.log( "error in forgot-password " , error ) ;

        res.status(500).json({
            success:false,
            message:"internal server error"
        })

    }



}

async function resetPasswordController( req , res ) {


    const {token} = req.params;

    const { password , confirmPassword } = req.body;

    if(!token){
        return res.status(400).json({
            success:false,
            message:"Invalid Token"
        })
    }

    if(!password || !confirmPassword){
        return res.status(400).json({
            success:false,
            message:"Password is required"
        })
    }
     if(password.length < 6){
            return res.status(400).json({
                success:false,
                message:"Password must be at least 6 characters long"
            })
        }

        if(password !== confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Password and Confirm Password do not match"
            })
        }  

    try{

        

        const user  = await userModel.findOne( {
             resetPasswordToken:token ,
             resetPasswordTokenExpiresAt:{$gt:Date.now()}
            } ) ;
          if( !user ){
               return res.status(400).json({

                   success:false,
                   message:"Invalid/Expired Token" ,

               })
            }
         const hashedPassword = await bcryptjs.hash(password, 10);
            user.password=hashedPassword;

            user.resetPasswordToken=undefined;
            user.resetPasswordTokenExpiresAt=undefined;
            await user.save();


            await sendPasswordResetSuccessMail( user.email );

        res.status(201).json({
            success:true,
            message:"Password reset successfully"
        })

    }
    catch( error ){


        console.log( "error in reset-password " , error ) ;

        res.status(500).json({
            success:false,
            message:"internal server error"
        })

    }


}

async function checkAuthController(req , res){
    try{

        const user  = await userModel.findOne( { email:req.email } ) ;
         if(!user){
            return res.status(400).json({
                success:false,
                message:"User not found"
            })
         }

    res.status(200).json({
        success:true,
        message:"User is authenticated",
        user:{
            ...user._doc,
            password:undefined,
        }
    })
    }
    catch(error){
        console.log("error in check-auth ",error);
        res.status(500).json({
            success:false,
            message:"internal server error"
        })
    }
}


module.exports = { signupController, loginController, logoutController , verifyController ,forgotPasswordController ,resetPasswordController,checkAuthController};