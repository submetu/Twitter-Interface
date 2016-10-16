var express = require('express');
var router = express.Router();
var sendData = require('../twitter-api');
/* GET home page. */
router.get('/', function(req, res, next) { 
  //Call the sendData function to get the newMainArr from twitter-api.js
  sendData(function(err,newMainArr){
  	if(err){
  		throw err;
  	}
  	//Comment this out to see the contents of the newMainArr
  	console.log(newMainArr); 
  	
  	//render the page with the "newMainArr" passed to the view as a variable called "mainArr"
  	res.render('index', { mainArr:newMainArr});
  });
  
});

module.exports = router;
