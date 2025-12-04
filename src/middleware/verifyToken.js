
const jwt = require("jsonwebtoken");

function verifyToken(req , res , next){  

     const token = req.cookies.token;
     if(!token){
        return res.status(401).json({
            success:false,
            message:"Unauthorized"
        })
     }
     jwt.verify(token , process.env.JWT_SECRET , (err , user) => {
        if(err){
            return res.status(401).json({
                success:false,
                message:"Unauthorized"
            })
        }

        req.email = user.email;
        next();
     })
    
}   

module.exports = verifyToken;