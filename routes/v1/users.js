var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');
var auth = require('../../modules/auth');

// current user details
router.get('/', auth.verifyToken, async (req, res) => {
  try{
  var user = await User.findById(req.user.userId)
  res.json({Profile: {username:user.name, bio: user.bio, image: user.image, following: false }})
} catch(error){
    res.status(400).json(error)
  }
});

//update user

router.put('/', auth.verifyToken, async (req, res) => {
  try{
    var user = await User.findByIdAndUpdate(req.user.userId, req.body,{new:true})
    res.json({Profile: {username:user.name, bio: user.bio, image: user.image, following: false, email: user.email }})
  } catch(error){
      res.status(400).json(error)
    }
})


// register
router.post('/',  async (req, res) => {
  try {
    var user = await User.create(req.body);
    console.log(user);
    res.json(user);
  } catch (error) {
    res.json(error);
  }
});

router.post('/login', async (req, res) => {
  var { email, password } = req.body;
  try {
    var user = await User.findOne({ email });
    if(!user) return res.status(400).json({error: "this email is not registered"});
    var result = await user.verifyPassword(password);
    if(!result) return res.status(400).json({error: "abd password"});
    var token = await auth.generateJWT(user);
    res.json({Profile: {username:user.name, bio: user.bio, image: user.image, token: token, following: false }})
  } catch (error) {
    res.status(400).json(error);
  }
})


module.exports = router;