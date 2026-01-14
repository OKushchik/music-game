const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
      expires: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);

