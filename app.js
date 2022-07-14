const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mongoConnect = require('./util/database').mongoConnect;

const alpha = require('alphavantage')({ key: '2FIA4GJLRWU9BIAT' });
const cron = require('node-cron');

const pricer = require('./util/pricer');

cron.schedule('0 */5 * * * *', ()=> {     
    pricer.getPrices();
});
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery/dist')));

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const viewRoutes = require('./routes/view');

app.use(viewRoutes);

mongoConnect(() => {  
    console.log("Listening on 4300...");     
    app.listen(4300);
});
