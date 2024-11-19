const mongoose = require('mongoose');
const Card = require('./Card');

const ListSchema = new mongoose.Schema({
  title: { type: String, required: true },
  cards: [Card.schema],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('List', ListSchema);