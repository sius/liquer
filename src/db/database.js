const mongoose = require('mongoose')
  , GMA_DB_SERVER = process.env.GMA_DB_URI || `localhost:27017`
  , GMA_DB = 'gma-invest'
  , OPTIONS = {
      useNewUrlParser: true
    , useCreateIndex: true
    , useFindAndModify: false
    , bufferCommands: true
    , autoIndex: false // Don't build indexes
    , reconnectTries: Number.MAX_VALUE // Never stop trying to reconnect
    , reconnectInterval: 500 // Reconnect every 500ms
    , poolSize: 10 // Maintain up to 10 socket connections
    // If not connected, return errors immediately
    // rather than waiting for reconnect
    , bufferMaxEntries: 0
    // Give up initial connection after 10 seconds
    , connectTimeoutMS: 10000
    // Close sockets after 45 seconds of inactivity
    , socketTimeoutMS: 45000
    // Use IPv4, skip trying IPv6
    , family: 4
    , keepAlive: true
    , keepAliveInitialDelay: 300000
  };

class Database {
  constructor() {
    this._connect()
  }
  _connect() {
     mongoose.connect(`mongodb://${GMA_DB_SERVER}/${GMA_DB}`, OPTIONS)
       .then(() => {
         console.log('Database connection successful')
       })
       .catch(err => {
         console.error('Database connection error')
       })
  }
}
module.exports = new Database()
