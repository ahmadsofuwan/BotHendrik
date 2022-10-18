const port = 3000;
const puppeteer = require('puppeteer');
const express = require("express");
const http = require('http')
const app = express();
const server = http.createServer(app);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const headlessStatus = true //true No Ui



function tx(data, callback) {
    (async () => {
        const baseLink = 'https://bscscan.com/tx/'+data.tx;
        const status = '#ContentPlaceHolder1_maintable > div:nth-child(3) > div.col.col-md-9 > span';
        const from = '#addressCopy';
        const value ='#ContentPlaceHolder1_spanValue > span > span';
        const to ='#contractCopy';

        const browser = await puppeteer.launch({ headless: headlessStatus, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        const navigationPromise = page.waitForNavigation();

        try{
            console.log('open page ' + baseLink);
            await page.goto(baseLink);
            console.log('grap data');
            await navigationPromise;

            // pengambilan data 

            var statusElm = await page.evaluate((status) => {
                return $(status).text();
            },status);
            
            var fromElm = await page.evaluate((from) => {
                return $(from).text();
            },from);
            var toElm = await page.evaluate((to) => {
                return $(to).text();
            },to);

            var valueElm = await page.evaluate((value) => {
                return $(value).text();
            },value);

           
            var result={
                status:statusElm,
                from:fromElm,
                value:valueElm,
                to:toElm,
            };
            browser.close();
            return callback(result);
        }catch(error){
            browser.close();
            var result = {status:'error'}
            return callback(result);
        }

        
    })()
};

server.listen(port, function () {
    console.log('server bejalan di port ' + port)
})
app.post('/tx', (req, res) => {
    tx(req.body, function (data) {
        res.json({data})
    })
})
