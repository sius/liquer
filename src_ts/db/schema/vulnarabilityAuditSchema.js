const mongoose = require('../mongoose-ext');

import { vulnarabilitySchema } from './vulnarabilitySchema'

export const vulnarabilityAuditSchema = new mongoose.Schema({
  vulnarabilities: [vulnarabilitySchema]
});
