const alpha = require('alphavantage')({ key: '2FIA4GJLRWU9BIAT' });;
const Asset = require('../models/asset');

function getPrices(){
    Asset.fetchAll()
        .then(assets => {
            assets.forEach(asset => {                   
                alpha.data.quote(`${asset.ticker}.SA`, 'compact', 'json', '5min')
                    .then(result => {
                        //console.log(result['Global Quote']['05. price']);
                        const newPrice = parseFloat(result['Global Quote']['05. price']);
                        if(asset.marketPrice != newPrice){
                            Asset.updatePrice(asset._id, newPrice)
                            .then(result => {
                                console.log(`${asset.ticker} new price: ${newPrice}.`);
                            }); 
                        } else {
                            console.log(`${asset.ticker} price unchanged.`);
                        }               
                                                
                    })
                    .catch( err => console.log(err));
                //asset.getPrice();
            });
            
        })
        .catch(err=> console.log(err));
    
}

module.exports = {getPrices};