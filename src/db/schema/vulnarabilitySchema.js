const mongoose = require('../mongoose-ext');

export const vulnarabilitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});
