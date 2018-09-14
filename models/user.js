const bcrypt = require('bcrypt-nodejs');
const mongoose = require('mongoose');
//const mongooseAlgolia = require('mongoose-algolia');
const crypto = require('crypto');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: { type: String, unique: true, lowercase: true},
  name: String,
  password: String,
  photo: String,
  about: String,
  //googleId: String,
  gigs: [{
     type: Schema.Types.ObjectId, ref: 'Gig'
  }],
  cart: [{
    type: Schema.Types.ObjectId, ref: 'Gig'
 }]
});

UserSchema.pre('save', function(next) {
  var user = this;
  if (!user.isModified('password')) return next();
  if (user.password) {
    bcrypt.genSalt(10, function(err, salt) {
      if (err) return next(err);
      bcrypt.hash(user.password, salt, null, function(err, hash) {
        if (err) return next(err);
        user.password = hash;
        next(err);
      });
    });
  }
});


UserSchema.methods.comparePassword = function(password) {

    return bcrypt.compareSync(password, this.password);
};

UserSchema.methods.gravatar = function(size) {
  if (!size) size = 200;
  if (!this.email) return 'https://gravatar.com/avatar/?s=' + size + '&d=retro';
  var md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro';
};
/*
UserSchema.plugin(mongooseAlgolia,{
  appId: '1U5U5W4DI2',
  apiKey: '2068c957e946c6c8876cb807ec24fd8c',
  indexName: 'UserSchema', //The name of the index in Algolia, you can also pass in a function
  selector: 'email _id name about', //You can decide which field that are getting synced to Algolia (same as selector in mongoose)
  populate: {
    path: 'owner',
    select: 'name'
  },
  defaults: {
    author: 'unknown'
  },
  mappings: {
    title: function(value) {
      return `Book: ${value}`
    }
  },
  debug: true // Default: false -> If true operations are logged out in your console
});


let Model = mongoose.model('User', UserSchema);

Model.SyncToAlgolia(); //Clears the Algolia index for this schema and synchronizes all documents to Algolia (based on the settings defined in your plugin settings)
Model.SetAlgoliaSettings({
  searchableAttributes: ['name','owner.name'] //Sets the settings for this schema, see [Algolia's Index settings parameters](https://www.algolia.com/doc/api-client/javascript/settings#set-settings) for more info.
}); */

module.exports = mongoose.model('User', UserSchema);

