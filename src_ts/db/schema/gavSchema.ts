const mongoose = require('../mongoose-ext');

export const gavSchema = new mongoose.Schema({
  groupId:  {
    type: String,
    required: true
  },
  artifactId: {
    type: String,
    required: true
  },
  version: {
    type: String,
    required: true
  }
});
