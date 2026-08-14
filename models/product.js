const mongoose = require('mongoose');

const { Schema } = mongoose;

const productSchema = new Schema({
  imagePath: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  id: { type: Number, required: true, unique: true },
});

module.exports = mongoose.model('Product', productSchema);
