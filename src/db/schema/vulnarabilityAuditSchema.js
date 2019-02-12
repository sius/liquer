const mongoose = require('../mongoose-ext');

const { vulnarabilitySchema } = require('./vulnarabilitySchema');

export const vulnarabilityAuditSchema = new mongoose.Schema({
  vulnarabilities: [vulnarabilitySchema]
});
