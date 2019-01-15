const mongoose = require('../mongoose-ext');

import { gavSchema } from './gavSchema';
import { licenseAuditSchema } from './licenseAuditSchema';
import { vulnarabilityAuditSchema } from './vulnarabilityAuditSchema';

export const mavenDependencySchema = new mongoose.Schema({
  downloaded:  {
    type: String,
    required: true
  },
  gav: {
    type: gavSchema,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  pom: {
    type: mongoose.SchemaTypes.Mixed,
    required: true
  },
  pomfile: {
    type: String,
    required: true
  },
  licenseAudit: {
    type: licenseAuditSchema,
    required: true
  },
  vulnarabilityAudit: {
    type: vulnarabilityAuditSchema,
    required: false
  }
});
