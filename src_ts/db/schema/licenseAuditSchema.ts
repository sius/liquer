const mongoose = require('../mongoose-ext');

export const licenseAuditSchema = new mongoose.Schema({
  licenseName:  {
    type: String,
    required: true
  },
  spdxName: {
    type: String,
  },
  url: {
    type: String,
  },
  use: {
    type: Number,
    default: 0
  }
});
