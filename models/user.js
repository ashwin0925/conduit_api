var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var Schema = mongoose.Schema;

var userSchema = new Schema({
  name: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  password: { type: String, required: true},
  bio:{type:String},
  image:{type:String},
  following:[{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  favorites:[{
    type: Schema.Types.ObjectId,
    ref:'Article'
  }]
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if(this.password && this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
    next()
  }
  next()
});

userSchema.methods.verifyPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
  
}

module.exports = mongoose.model('User', userSchema);