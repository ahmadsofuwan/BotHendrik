const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const serverPort = 3000;
fs = require('fs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const headlessStatus = false; //true no Ui

const baseurl = 'https://bscscan.com/tx/';
const status = '#ContentPlaceHolder1_maintable > div:nth-child(3) > div.col.col-md-9 > span';
const from = '#addressCopy';
const value ='#ContentPlaceHolder1_spanValue > span > span';

function chekTx(data, callback) {
  (async () => {
    const browser = await puppeteer.launch({
      headless: headlessStatus,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    // const navigationPromise = page.waitForNavigation();
    await page.setDefaultNavigationTimeout(0);
    console.log('open page '+baseurl+data.tx);
    try{
      await page.goto(baseurl+data.tx);
      console.log('grap data');
    // pengambilan data 
      var statusElm = await page.evaluate((status) => {
        return $(status).text();
      },status);
      
      var fromElm = await page.evaluate((from) => {
        return $(from).text();
      },from);
      var valueElm = await page.evaluate((value) => {
        return $(value).text();
      },value);

    // var result = {
    //   status:statusElm,
    //   from:from,
    //   value:valueElm
    // }
    var result=[statusElm,from,valueElm];
    browser.close();
    return callback(result);
  }catch(error){
    browser.close();
    var result = {status:'error'}
    return callback(result);
    }
  })();
}
app.post('/tx', (req, res) => {

  chekTx(req.body, function (data) {
    res.send(data);
  });

});

var doc = '\nsend post : Tx Code';
app.listen(serverPort, () => console.log('Server Berjalan di port ' + serverPort, doc));
