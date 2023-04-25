var jwt = require('jsonwebtoken');
const JWT_SECRET = "tusharg@ndHi";

const fetchuser = (req, res, next)=>{
	// get the token from header or get the user from jwt token and add id to req object
	const token = req.header('auth-token');
	// valid token not present
	if(!token){
		res.status(401).send({error: "Please authenticate using a valid token"})
	}
	try{
		// verify the toke and jwt secret
		const data = jwt.verify(token,JWT_SECRET);
		req.user = data.user;
		next();

	}catch(error){
		res.status(401).send({error: "Please authenticate using a valid token"})
	}
}

module.exports = fetchuser;