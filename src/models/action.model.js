const mongoose = require('mongoose');

const actionSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      optional: true,
    },
    type: {
      type: String,
      enum: ['appel', 'email', 'courrier', 'visite'],
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    result: {
      type: String,
    },
    comment: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Action', actionSchema);