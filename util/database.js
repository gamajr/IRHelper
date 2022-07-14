const { MongoClient} = require('mongodb');
let _db;

mongoConnect = callback => {    
    const uri = "mongodb://127.0.0.1:27017/irhelper";
    MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true})
      .then(client => {
        console.log("Connected"); 
        _db = client.db();
        callback(client);
      })
      .catch(err => {
        console.log(err);
        throw err;
      }); 
};
const getDb = () => {
  if (_db){
    return _db;
  }
  throw 'No database found!';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
