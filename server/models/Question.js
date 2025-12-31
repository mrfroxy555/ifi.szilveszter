const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['scale', 'text', 'select'],
    required: true,
  },
  // For scale: [minLabel, maxLabel] e.g. ["Egyáltalán nem", "Teljes mértékben"]
  // For text: null or empty
  options: [String],
  category: {
    type: String,
    default: 'general'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Question', QuestionSchema);
