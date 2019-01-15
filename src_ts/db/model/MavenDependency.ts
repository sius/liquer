const mongoose = require('../schema/mongoose-ext');
import { mavenDependencySchema } from '../schema/mavenDependencySchema';
module.exports = mongoose.model('News', mavenDependencySchema);
