var express = require('express');
var router = express.Router();
var userRouter = require('./users.js');
var auth = require('../../modules/auth');
var User = require('../../models/user');
var articleRouter = require('./articles')
var Article = require('../../models/article')


/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({index: true});
});

router.get('/protected',auth.verifyToken, (req, res) => {
  res.json({protected: true})
})

//get profile
router.get('/profiles/:username', auth.verifyToken, async(req, res)=>{
  try{
    var user = await User.findOne({name:req.params.username})
    res.json({Profile: {username:user.name, bio: user.bio, image: user.image, following: false, email: user.email }})
  } catch(error){
      res.status(400).json(error)
    }
})

// //follow user
// router.get('/profiles/:username/follow', auth.verifyToken, async(req, res)=>{
//   try{
//     var userId = await User.findOne(req.params.username)
//   var user = await User.findByIdAndUpdate(req.user.userId, { $push: {"following": userId} }, {new:true})
//   res.json({user: 'added to following'})

//   }catch(error){
//     res.status(400).json(error)
//   }
// })

// //unfollow user
// router.delete('/profiles/:username/follow', auth.verifyToken, async (req, res) => {
//   try{
//     var userUnfollow = await User.findByIdAndRemove(req.params.username)
//     var unfollow = await User.findOneAndUpdate(req.user.userId, { $pull:{"following": userId}})
//     res.json({unfollow: 'unfollowed true'})
//   }
//   catch(error){
//     res.status(400).json(error)
//   }
// })


//tags
router.get('/tags', async(req,res) => {
  try {
    var tags = await Article.find().distinct('tagList');
    res.json({tags})
  }catch(error){
    res.status(400).json(error)
  }
})


router.use('/users', userRouter);
router.use('/articles', articleRouter)
module.exports = router;
