const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;

const SALT_ROUNDS = 10;

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

userSchema.methods.encryptPassword = function encryptPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
};

userSchema.methods.validPassword = function validPassword(password) {
  if (!this.password) {
    return Promise.resolve(false);
  }
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
