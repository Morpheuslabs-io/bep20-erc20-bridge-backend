const Schema = require('mongoose').Schema;

const BscEventSchema = new Schema({
  _id: {
    type: String,
    required: true
  },
  blockNumber: {
    type: Number,
    required: true
  },
  fromAddress: {
    type: String,
    required: true
  },
  amount: {
    type: String,
    required: true
  },
  isProcessed: {
    type: Boolean,
    required: true
  },
  receiptHash: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  }
}, {
  collection: 'bscEvents'
});

module.exports = BscEventSchema;