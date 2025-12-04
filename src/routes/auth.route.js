const express = require('express');
const { signupController, loginController, logoutController, verifyController, forgotPasswordController, resetPasswordController ,checkAuthController } = require('../controllers/auth.controller');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();


router.post('/signup', signupController );
router.post('/verify' , verifyController);
router.post('/login', loginController);
router.post('/logout', logoutController );

router.post('/forgot-password' , forgotPasswordController  ) ;
router.post('/reset-password/:token' , resetPasswordController  ) ;

router.get('/check-auth',verifyToken , checkAuthController ) ;


module.exports = router;