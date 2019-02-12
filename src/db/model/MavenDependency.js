const mongoose = require('../schema/mongoose-ext');
const { mavenDependencySchema } = require('../schema/mavenDependencySchema');
module.exports = mongoose.model('News', mavenDependencySchema);
