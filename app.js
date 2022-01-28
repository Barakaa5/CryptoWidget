var express    = require("express"),
    app        = express(),
    bodyParser = require('body-parser'),
	request    = require('request');
    

app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));


//Order ID random creator//
function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}
var orderID =  makeid(11)
//Order ID random creator//
 

app.get("/", function(req, res){
    res.render("landing",{orderID: orderID});
});

app.get("/success", function(req, res){
    res.render("success",{orderID: orderID});
});

app.get("/failed", function(req, res){
    res.render("failed",{orderID: orderID});
});

app.get("/payment", function(req, res){
    res.render("payment");
});


app.post('/payment', function (req, res) {
	var orderID = req.body.orderID;
	var coinRate = req.body.coinName;

	request(
		'https://mapi.xchangepro.net/api/rates?merchant_id=7d8322d1-f8a2-11e8-9a4c-4231c39084ce&amount=50&currency=USD&c1=custom_param1&c2=custom_param2',
		function (error, response, body) {
			if (error) {
				console.log('---------------------------------------------------');
				console.log('Barak, there is an error and this is what happend:');
				console.log('---------------------------------------------------');
				console.log(error);
			} else {
				if (response.statusCode == 200) {
					var parsedData = JSON.parse(body);
					var amount = parsedData.request_details[`${coinRate}_USD`] * 5000;

					request.post(
						'https://mapi.xchangepro.net/api/transaction?currency_1_iso=BTC&currency_1_amount=0.00556310&currency=USD&amount=50&merchant_id=7d8322d1-f8a2-11e8-9a4c-4231c39084ce&transaction_c1=custom_param1&transaction_c2=custom_param2',
						function (error, response, body) {
							if (error) {
								console.log('---------------------------------------------------');
								console.log('Barak, there is an error and this is what happend:');
								console.log('---------------------------------------------------');
								console.log(error);
							} else {
								if (response.statusCode == 200) {
									var parsedData = JSON.parse(body);
									var address = parsedData.request_details.currency_1_address;
									var QR = parsedData.request_details.qr;
									var data = { coinRate, amount, orderID, address, QR};
									res.render('payment', { data: data });
								}
							}
						}
					);
				}
			}
		}
	);
});


//Syntax Suitable for Heroku:
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`app is running on port ${ PORT }`);
});
