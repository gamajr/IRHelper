const mongoDB = require('mongodb');
const getDb = require('../util/database').getDb;


class Asset{
  constructor(publicName, entName, cnpj, ticker, id){
    this._id = id? new mongoDB.ObjectId(id) : null;
    this.publicName = publicName;
    this.entName = entName;
    this.cnpj = cnpj;
    this.ticker = ticker;
    this.meanPrice = 0;
    this.marketPrice = 0;
    this.quantity = 0;
    this.buys = [];
    this.sells = [];        
    this.jcps = [];
    this.divs = [];        
  }  
  save(){
    const db = getDb();
    let dbOp;
    if (this._id){
      dbOp = db.collection('assets')
        .updateOne({_id: this._id}, {$set: this});
    } else {
      dbOp = db.collection('assets')
        .insertOne(this);
    } 
    return dbOp
      .then(result => {
        console.log(result);
      })
      .catch(err => {
        console.log(err);
      });        
  }
  
  static updatePrice(assetId, value){
    const db = getDb();
    return db.collection('assets')
      .updateOne(
        {_id: new mongoDB.ObjectId(assetId)}, 
        {$set: {marketPrice: value}}
      )
      .then(result => {
        console.log(`Updated Price: ${value}`);        
      })
      .catch(err => console.log(err)); 
  }

  static findById(assetId){
    const db = getDb();
      return db.collection('assets')
        .find({_id: new mongoDB.ObjectId(assetId)})
        .next()
        .then(asset => {          
          return asset;
        })
        .catch(err => console.log(err));
  }

  static fetchAll(){
    const db = getDb();
    return db.collection('assets')
      .find()
      .toArray()
      .then(assets => {
        //console.log(assets);
        return assets;
      })
      .catch(err => console.log(err));               
  } 
}


module.exports = Asset;