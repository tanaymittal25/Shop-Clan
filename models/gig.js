const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const GigSchema = new Schema ({

    owner: { type: Schema.Types.ObjectId, ref:'user'},
    title: String,
    category: String,
    about: String,
    price: Number,
    picture: {type: String, default:'http://placehold.it/350x150'},
    create: {type: Date, default:Date.Now}
});

module.exports = mongoose.model('Gig',GigSchema);
