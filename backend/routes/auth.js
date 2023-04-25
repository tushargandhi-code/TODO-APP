const express = require('express');
const router = express.Router(); // importing express router
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

// Route 1 - Creating a user

// jasa app tha bus uski jgah router lgana ha 	

// creating a user using post "/api/auth/createuser". no login required	
router.post('/createuser',[


	// name must be at least 5 chars long
  body('name','Enter a valid name').isLength({ min: 5 }),

	// username must be an email
  body('email','Enter a valid Email').isEmail(),

  // password must be at least 5 chars long
  body('password','Password must be of 5 characters').isLength({ min: 5 }),

	], async (req, res)=>{
	 console.log(req.body)
     let success = false;

	 // if there are errors , return bad request and errors
	 const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({success , errors: errors.array() });
    }
    try{

    // check whether the user with same email exit or not 
    let user = await User.findOne({email:req.body.email})
    if(user){  // email already exit
        return res.status(400).json({success , error:"Sorry a user with the same email already exist"})
    }
    // bcrypt works in two steps 1. generate salt and 2 . hash the password with the generated salt
    
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password,salt)

    // creating new user
     user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: secPass,
    })
     const JWT_SECRET = "tusharg@ndHi";  // secret
     const data = {                      // data object or data we want to send in jwt token
     	user:{
     		id:user.id
     	}
     }
     const authtoken = jwt.sign(data , JWT_SECRET )
     success = true
     res.json({success ,authtoken})
     // catch errors
 } catch(error){
 	console.log(error.message)
 	res.status(500).send("some error occured")
 }
  },
);

// Router 2 - for login 

// creating a user using post "/api/auth/login"
router.post('/login',[

	// username must be an email
  body('email','Enter a valid Email').isEmail(),

  // password must be at least 5 chars long
  body('password','Password cannot be blank').exists(),

	], async (req, res)=>{
	 console.log(req.body)
   let success = false;

	 // if there are errors , return bad request and errors
	 const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // destructuring
    const{email,password} = req.body;
    try{
    	// find the user in db with the entered email of client 
    	let user = await User.findOne({email});	
    	// error if invalid email is entered 
    	if(!user){
    		return res.status(400).json({success ,error:"Please try to login with correct credentials"});
    	}
    	// comparing the password
    	const PassCompare = await bcrypt.compare(password,user.password);
    	if(!PassCompare){
    		return res.status(400).json({success ,error:"Please try to login with correct credentials"});
    	}
    	const data = {                      // data object or data we want to send in jwt token
     	user:{
     		id:user.id
     	}
     }
     const JWT_SECRET = "tusharg@ndHi";  // secret
     const authtoken = jwt.sign(data , JWT_SECRET )
     success = true;
     res.json({success , authtoken})

    } catch(error){
    	console.log(error.message)
 	res.status(500).send("some error occured")
    }
    
})

// Route 3  Get login user details
router.post('/getuser', fetchuser,async(req,res)=>{
	try{
		// getting the user id
		userID = req.user.id;
		const user = await User.findById(userID).select("-password")// select all except password
		res.send(user);

	} catch(error){
		console.log(error.message)
 	    res.status(500).send("some error occured")
	}
})


module.exports = router;	