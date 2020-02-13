var express = require('express')
var router = express.Router();
var Article = require('../../models/article')
var auth = require('../../modules/auth')
var Comment = require('../../models/comment')
var User = require('../../models/user')


//create article
router.post('/', auth.verifyToken, async (req,res) => {
  try{
  req.body.author = req.user.userId
  var newArticle = await Article.create(req.body)
  var article = await Article.findById(newArticle.id).populate('author')
  res.json({article})
  } catch(error){
    res.status(400).json(error)
  }
})

//feed article
router.get('/feed', auth.verifyToken, async(req, res) => {
  try{
    var user = await User.findOne({"_id" : req.user.userId})
    await Article.find({"author":{$in: user.following}})
    .sort({created: -1})
    .limit(10)
    .exec((err, result) =>{
      if(err) return next(err)
      res.json({result})
    })
  }catch(error){
    res.status(400).json(error)
  }
})

//list articles
router.get('/', async(req,res)=>{
  try{
    var article = await Article.find()
    res.json({article})
  }catch(error){
    res.status(400).json(error)
  }
})


// get article
router.get('/:slug', async (req, res) => {
try{
  var article = await Article.findOne({slug:req.params.slug}).populate('author')
  if(!article) return res.status(400).json({err:'article not found'})
  res.json({article})
} catch(error){
  res.status(400).json(error)
}
})

// update article

router.put('/:slug', auth.verifyToken, async (req, res) => {
  try{
    var article = await Article.findOneAndUpdate({slug:req.params.slug}, req.body, {new:true}).populate('author')
    if(!article) return res.status(400).json({err:'article not found'})
    res.json({article})
  } catch(error){
    res.status(400).json(error)
  }
  })

  // delete article

  router.delete('/:slug', auth.verifyToken, async (req, res) => {
    try{
      var article = await Article.findOneAndRemove({slug:req.params.slug})
      if(!article) return res.status(400).json({err:"article not found"})
      res.json({deleted: true})
    } catch(error){
      res.status(400).json(error)
    }
  })

//create comment

router.post('/:slug/comments', auth.verifyToken, async (req, res) => {
  try{
    req.body.article = (await Article.findOne({slug:req.params.slug})).id
    req.body.author = await req.user.userId
    var comment = await Comment.create(req.body)
    var article = await Article.findOneAndUpdate({slug:req.params.slug},{$push:{"comments":comment._id}})
    res.json({comment: comment.body})
  }
  catch(error){
    res.status(400).json(error)
  }
})


//delete comment

router.delete('/:slug/comments/:id', auth.verifyToken, async (req, res) => {
  try{
    // req.body.article = (await Article.findOne({slug:req.params.slug})).id
    // req.body.author = await req.user.userId
    var comment = await Comment.findByIdAndRemove(req.params.id)
    var article = await Article.findOneAndUpdate({slug:req.params.slug},{$pull:{"comments":req.params.id}})
    res.json({comment: 'deleted true'})
  }
  catch(error){
    res.status(400).json(error)
  }
})

//favorite article
router.post('/:slug/favorite', auth.verifyToken, async(req,res) => {
  try{
  var articleId = (await Article.findOne({slug: req.params.slug})).id
//  console.log(User.findById(req.user.userId))
  var user = await User.findByIdAndUpdate(req.user.userId, { $push: {"favorites": articleId} }, {new:true})
  res.json({article: 'added to favorites'})
  } catch(error) {
    res.status(400).json(error)
  }
})


//unfavorite article
router.delete('/:slug/unfavorite', auth.verifyToken, async(req,res) => {
  try{
  var articleId = await (await Article.findOne({slug: req.params.slug})).id
  var user = await User.findByIdAndUpdate(req.user.userId, { $pull: {"favorites": articleId} })
  res.json({article: 'removed from favorites'})
  } catch(error) {
    res.status(400).json(error)
  }
})



module.exports = router