const { redirect } = require('express/lib/response');
const mongodb = require('mongodb');

const ObjectId = mongodb.ObjectId;

const Asset = require("../models/asset");

exports.getIndex = (req, res, next) => {
    Asset.fetchAll()
        .then( assets =>{            
            res.render('index', {
                title: 'Ativos',
                assets: assets,
                path: '/'
            });
        })
        .catch(err => console.log(err));        
};
exports.getAssetDetail = (req, res, next) => {
    const assetId = req.params.assetId;    
    Asset.findById(assetId)
        .then(asset => {
            const buyValue = asset.meanPrice * asset.quantity;
            const totalValue = asset.marketPrice * asset.quantity;
            const variation = (asset.marketPrice-asset.meanPrice)*asset.quantity;
            let situation ='Prejuízo';
            if(variation >= 0){
                situation = 'Lucro';
            }
            res.render('asset-detail', {
                path: '/asset-detail',
                title: `Detalhes: ${asset.publicName}`,
                asset: asset,
                variation: variation,
                totalValue: totalValue,
                buyValue: buyValue,
                situation: situation
                });
        });    
};
exports.getEditAsset = (req, res, next) =>{   
    const assetId = req.params.assetId;
    //req.user.getProducts({ where: {id: assetId, }})
    //Product.findByPk(assetId).
    Asset.findById(assetId)    
        .then(asset => {            
            if (!asset){
                return res.redirect('/');
            }
            res.render('upsert-asset', {
            title: 'Editar Ativo',
            path: '/edit-asset',
            editing: true,
            asset: asset
        });
    }).
        catch(err => console.log(err));
};
exports.postEditAsset = (req, res, next) =>{
    const assetId = req.body.assetId;
    const uPublicName = req.body.publicName;
    const uEntName = req.body.entName;
    const uCnpj = req.body.cnpj;
    const uTicker = req.body.ticker;
    Asset.findById(assetId)
    .then(asset => {
        const updatedAsset = new Asset(                                 
            uPublicName,
            uEntName,
            uCnpj,
            uTicker,    
            ObjectId(assetId)
        );
        updatedAsset.marketPrice = asset.marketPrice;
        updatedAsset.buys = [...asset.buys];   
        updatedAsset.sells = [...asset.sells]; 
        updatedAsset.meanPrice = asset.meanPrice;
        updatedAsset.quantity = asset.quantity;  
        updatedAsset.jcps = [...asset.jcps];
        updatedAsset.divs = [...asset.divs];     
       
        return updatedAsset.save()
            .then(result =>{                    
                res.redirect(`/asset-detail/${assetId}`);
            });     
        
    })
    .catch(err => console.log(err));
};
exports.getAddAsset = (req, res, next) =>{
    res.render('upsert-asset', {
        title: 'Adicionar Ativo',
        path: '/add-asset',
        editing: false
    })
};
exports.postAddAsset = (req, res, next) =>{
    const entName = req.body.entName;    
    const publicName = req.body.publicName;
    const cnpj = req.body.cnpj;
    const ticker = req.body.ticker;
    const asset = new Asset(
        publicName,
        entName,
        cnpj,
        ticker
    );
    asset.save()
        .then(result => {            
            console.log("Asset Created");           
            res.redirect('/');
        })
        .catch(err => console.log(err));
        

};
exports.getAddBuy = (req, res, next) => {
    const assetId = req.params.assetId;
    Asset.findById(assetId)
        .then(asset=> {
            res.render('add-operation', {
                title: 'Incluir Compra',
                path: '/add-buy',
                operation: 'buy',
                asset: asset
            })
        })
        .catch(err => console.log(err)); 
    
};
exports.postAddBuy = (req, res, next) => {
    const assetId = req.body.assetId;
    const date = req.body.date;
    const quantity = parseInt(req.body.quantity);
    const price = parseFloat(req.body.price);
    
    Asset.findById(assetId)
        .then(asset => {
            const updatedAsset = new Asset(                                 
                asset.publicName,
                asset.entName,
                asset.cnpj,
                asset.ticker,    
                ObjectId(assetId)
            );
            asset.buys.push({
                date: date,
                quantity: quantity,
                price: price,
                _id: new ObjectId()
            });
            updatedAsset.buys = [...asset.buys];   
            updatedAsset.sells = [...asset.sells]; 
            updatedAsset.meanPrice = _calculateMeanPrice(updatedAsset.buys);
            updatedAsset.quantity = asset.quantity + quantity;
            updatedAsset.jcps = [...asset.jcps];
            updatedAsset.divs = [...asset.divs];        
           
            return updatedAsset.save()
                .then(result =>{                    
                    res.redirect(`/asset-detail/${assetId}`);
                });     
            
        })
        .catch(err => console.log(err));           
};
exports.postRemoveBuy = (req, res, next) => {
    const buyId = req.params.buyId;
    const assetId = req.body.assetId;
    
    Asset.findById(assetId)
        .then( asset=> {           
            const updatedAsset = new Asset(                                 
                asset.publicName,
                asset.entName,
                asset.cnpj,
                asset.ticker,    
                ObjectId(assetId)
            );
            updatedAsset.buys = asset.buys.filter( buy=>{
                return buy._id.toString()!= buyId.toString();
            });
            updatedAsset.sells = [...asset.sells];
            updatedAsset.meanPrice = _calculateMeanPrice(updatedAsset.buys);
            updatedAsset.quantity = _calculateQuantity(updatedAsset.buys) -
            _calculateQuantity(updatedAsset.sells);
            updatedAsset.jcps = [...asset.jcps];
            updatedAsset.divs = [...asset.divs];

            return updatedAsset.save()
                .then(result =>{                    
                    res.redirect(`/asset-detail/${assetId}`);
                });  

        })
        .catch( err=> console.log(err));
};
exports.getAddSell = (req, res, next) => {
    const assetId = req.params.assetId;
    Asset.findById(assetId)
        .then(asset=> {
            res.render('add-operation', {
                title: 'Incluir Compra',
                path: '/add-sell',
                operation: 'sell',
                asset: asset
            })
        })
        .catch(err => console.log(err)); 
};
exports.postAddSell = (req, res, next) => {
    const assetId = req.body.assetId;
    const date = req.body.date;
    const quantity = parseInt(req.body.quantity);
    const price = parseFloat(req.body.price);
    
    Asset.findById(assetId)
        .then(asset => {
            const updatedAsset = new Asset(                                 
                asset.publicName,
                asset.entName,
                asset.cnpj,
                asset.ticker,    
                ObjectId(assetId)
            );
            asset.sells.push({
                date: date,
                quantity: quantity,
                price: price,
                _id: new ObjectId()
            });
            updatedAsset.meanPrice = asset.meanPrice;
            updatedAsset.buys = [...asset.buys];
            updatedAsset.sells = [...asset.sells];    
            updatedAsset.quantity = _calculateQuantity(updatedAsset.buys) -
            _calculateQuantity(updatedAsset.sells); 
            updatedAsset.jcps = [...asset.jcps];
            updatedAsset.divs = [...asset.divs];      
           
            return updatedAsset.save()
                .then(result =>{                    
                    res.redirect(`/asset-detail/${assetId}`);
                });     
            
        })
        .catch(err => console.log(err));
};
exports.postRemoveSell = (req, res, next) =>{
    const sellId = req.params.sellId;
    const assetId = req.body.assetId;
    
    Asset.findById(assetId)
        .then( asset=> {           
            const updatedAsset = new Asset(                                 
                asset.publicName,
                asset.entName,
                asset.cnpj,
                asset.ticker,    
                ObjectId(assetId)
            );
            updatedAsset.meanPrice = asset.meanPrice;
            updatedAsset.sells = asset.sells.filter( sell=>{
                return sell._id.toString()!= sellId.toString();
            });  
            updatedAsset.buys = [...asset.buys];
            updatedAsset.quantity = _calculateQuantity(updatedAsset.buys) -
            _calculateQuantity(updatedAsset.sells);
            updatedAsset.jcps = [...asset.jcps];
            updatedAsset.divs = [...asset.divs];          
            return updatedAsset.save()
                .then(result =>{                    
                    res.redirect(`/asset-detail/${assetId}`);
                });          

        })
        .catch( err=> console.log(err));    
};


function _calculateMeanPrice(items){
    let quantity = 0;
    let totalValue= 0;
    items.forEach(element => {
        totalValue += (element.price * element.quantity);
        quantity += element.quantity;
    });
    if (quantity != 0){    
        return totalValue / quantity;
    }    
    return 0;
}
function _calculateQuantity(items){
    let quantity = 0;
    items.forEach(element => {
        quantity += element.quantity;
    });
    return quantity;
}