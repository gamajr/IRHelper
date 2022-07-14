const path = require('path');
const express = require('express');

const router = express.Router();
const adminController = require('../controllers/admin');

router.post('/add-asset', adminController.postAddAsset);
router.get('/add-asset', adminController.getAddAsset);
router.post('/edit-asset', adminController.postEditAsset);
router.get('/edit-asset/:assetId', adminController.getEditAsset);
router.get('/asset-detail/:assetId', adminController.getAssetDetail);
router.get('/add-buy/:assetId', adminController.getAddBuy);
router.post('/add-buy', adminController.postAddBuy);
router.post('/remove-buy/:buyId', adminController.postRemoveBuy);
router.get('/add-sell/:assetId', adminController.getAddSell);
router.post('/add-sell', adminController.postAddSell);
router.post('/remove-sell/:sellId', adminController.postRemoveSell);

router.get('/', adminController.getIndex);


module.exports = router;