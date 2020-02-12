var mongoose = require('mongoose');
var uniqueSlug = require('unique-slug')
var slug = require('slug')
var Schema = mongoose.Schema;

var articleSchema = new Schema({
  slug: {type: String},
  title: {type: String, required: true},
  description: { type: String, required: true},
  body:{type:String, required: true},
  tagList:[{type:String}],
  author:{
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  comments:[{type: Schema.Types.ObjectId,
    ref: 'Comment'
  }]
}, { timestamps: true });

articleSchema.pre('save', async function(next) {
  this.slug = slug(this.title) + '-'  + (Math.random() * Math.pow(36, 6) | 0).toString(36)
    next()
});

module.exports = mongoose.model('Article', articleSchema);