const express = require('express');
const router = express.Router(); // importing express router
const fetchuser = require('../middleware/fetchuser');
const Notes = require('../models/Notes');
const { body, validationResult } = require('express-validator');

// Route 1 get all the notes of user which is already loged in using get

router.get('/api/notes/fetchAllNotes', fetchuser , async(req, res)=>{
	try{
		// find notes of corresponding user 
		const notes = await Notes.find({user : req.user.id});
		// send notes as response
		res.json(notes)

	} catch(error){
		console.log(error.message)
 	    res.status(500).send("some error occured")
	}
	
})

// Router 2 - for adding notes
// hrr ek note jo add kraga uski alag id hogi or user id vo ha jo object id ha 
	
// adding notes using post "/api/auth/addnote"
router.post('/api/notes/addnote',fetchuser ,[

	
  body('title','Enter a valid Title').isLength({min:3}),

  // discription must be at least 5 chars long
  body('discription','discription must be at least 5 chars long').isLength({min:5}),

	], async (req, res)=>{
	try{
    	const {title , discription , tag} = req.body;  // destructuring

	 // if there are errors , return bad request and errors
	 const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    	// New note object containing title,desc,tag,user
    	const note = new Notes({
    		title , discription , tag , user : req.user.id
    	})
    	const savedNote = await note.save();
    	res.json(savedNote)
    } catch(error){
		console.log(error.message)
 	    res.status(500).send("some error occured");
	}
})

// Router 3 - Update an existing note using delete request
router.put('/api/notes/updatenote/:id', fetchuser , async(req,res)=>{
	// using destructuring
	try{
	const {title, discription,tag} = req.body;
	// create a newnote object
	const newnote = {};
	if(title){
		newnote.title = title;  // jb sirf title update hoga
	}
	if(discription){
		newnote.discription = discription;  // jb sirf discription update hoga
	}
	if(tag){
		newnote.tag = tag;  // jb sirf title update hoga
	}
	// find the node to be update and update it
	// geeting the notes with the help of findbyid method
	let note = await Notes.findById(req.params.id);
	if(!note){
		return res.status(404).send("Not Found")   // show error if note are not found
	}
	// now ab hum nhi chahte ki koe or user hmara notes ko change kra so
	// matching the existing user id with the logged in user id 
	if(note.user.toString() != req.user.id){
		return res.status(404).send("Not Allowed")   // show error if userid not matched 
	}
	// now find and updating the node
	note = await Notes.findByIdAndUpdate(req.params.id,{$set : newnote},{new:true})
	res.json({note})
    } catch(error){
		console.log(error.message)
 	    res.status(500).send("some error occured");
	}

})

// Router 4 - Deleting a note using delete
router.delete('/api/notes/deletenote/:id', fetchuser , async(req,res)=>{
	// using destructuring
	try{
	const {title, discription,tag} = req.body;
	
	// find the note to be deleted 


	let note = await Notes.findById(req.params.id);
	if(!note){
		return res.status(404).send("Not Found")   // show error if note are not found
	}
	// allow deletion only if user own this note 

	if(note.user.toString() != req.user.id){
		return res.status(404).send("Not Allowed")   // show error if userid not matched 
	}

	// now find and updating the node
	note = await Notes.findByIdAndDelete(req.params.id)
	res.json({success : "Note has been deleted",note:note})
	
    } catch(error){
		console.log(error.message)
 	    res.status(500).send("some error occured");
	}

})

module.exports = router;	
