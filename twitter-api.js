var Twitter = require('twitter');
var ta = require('time-ago')();
var nconf = require('nconf');
nconf.argv().env().file({ file: './conf.json' }); //A package to hide the sensitive twitter information

//IN ORDER TO SET YOUR TWITTER INFORMATION, CREATE A conf.json FILE IN THE ROOT DIRECTORY WITH THE FOLLOWING PARAMETERS
var consumerKey = nconf.get('consumer_key');
var consumerSecret = nconf.get('consumer_secret');
var accessTokenKey = nconf.get('access_token_key');
var accessTokenSecret = nconf.get('access_token_secret');
//Initialize the client with the sensitive information
var client = new Twitter({
  consumer_key: consumerKey,
  consumer_secret: consumerSecret,
  access_token_key: accessTokenKey,
  access_token_secret: accessTokenSecret
});
// A series of twitter api calls to get data in a sequence and saving it to the "mainArr"
//Get Timeline
var getTimeLine = function (){
	return new Promise (function(resolve,reject){
		client.get('statuses/home_timeline', {screen_name: 'MetuSub', count :5}, function(error, tweets, response) {
			var mainArr=[]; //The array that will be passed to all the subsequent twitter api calls
			var tempArr=[]; // a temporary array to hold information in
			for (var tweet in tweets){
				var testObject = {};
				var tweetDate = tweets[tweet].created_at; //date with twitter formatiing
				var newtweetDate = new Date(tweetDate); //date with regular formatiing
				newtweetDate= Date.parse(newtweetDate); // date in the form of a timestamp
				newtweetDate = ta.ago(newtweetDate); // time difference--- eg. 3 secs ago, 4 days ago---- handled by "time-ago" library
				testObject.createdAt= newtweetDate;
				testObject.name=tweets[tweet].user.name;
				testObject.screenName=tweets[tweet].user.screen_name;
				testObject.tweet=tweets[tweet].text;
				testObject.retweetCount=tweets[tweet].retweet_count;
				testObject.favoriteCount=tweets[tweet].favorite_count;
				testObject.profileImage=tweets[tweet].user.profile_image_url;
				tempArr.push(testObject);
			}
			mainArr.push(tempArr); //now mainArr array holds another array with Timeline information of the user
			resolve(mainArr);
		});
	});
};

//Get Following
var getFollowing = function (mainArr){ //the function gets the mainArr from the previous promise
	return new Promise(function(resolve,reject){
		client.get('friends/list', {screen_name: 'MetuSub', count :5}, function(error, following, response) {
			var followingArr = [];
			followingArr = following.users.map(function(item){
				var testObject = {};
				testObject.name = item.name;
				testObject.screenName = item.screen_name;
				testObject.profileImage = item.profile_image_url;
				return testObject; //Makes the "followingArr" hold the "testObject" inside it
			});
			mainArr.push(followingArr);
			resolve(mainArr);			
		});
	});
};
//received direct message
var getRecMessage = function(mainArr){//the function gets the mainArr from the previous promise
	return new Promise(function(resolve,reject){
		client.get('direct_messages', {count :5}, function(error, message, response) {
			var recMsgArr = [];
			recMsgArr = message.map(function(item){
				var testObject = {};
				testObject.message = item.text;
				testObject.senderName = item.sender.name;
				testObject.senderImage = item.sender.profile_image_url;
				var newTime = new Date(item.created_at);
				testObject.sentTimestamp = Date.parse(newTime);
				testObject.sentTimeAgo = ta.ago(newTime);
				return testObject;
			});
			mainArr.push(recMsgArr);
			resolve(mainArr);
		});
	});
};
//Sent direct message
var getSentMessage = function(mainArr){//the function gets the mainArr from the previous promise
	return new Promise(function(resolve,reject){
		client.get('direct_messages/sent', {count :5}, function(error, message, response) {
			var sentMsgArr = [];
			sentMsgArr = message.map(function(item){
				var testObject = {};
				testObject.message = item.text;
				testObject.senderName = item.sender.name;
				testObject.senderImage = item.sender.profile_image_url;
				var newTime = new Date(item.created_at);
				testObject.sentTimestamp = Date.parse(newTime);
				testObject.sentTimeAgo = ta.ago(newTime);
				testObject.recName = item.recipient.name;
				return testObject;
			});
			mainArr.push(sentMsgArr);
			resolve(mainArr);
		});
	});
};
//Get following Count and name and screen name of the user
var getFollowingCount = function(mainArr){//the function gets the mainArr from the previous promise
	return new Promise(function(resolve,reject){
		client.get('statuses/user_timeline', {screen_name: 'MetuSub', count :5}, function(error, following, response) {
			var followingCount;
			var name;
			var screen_name;
			var profileImage;
			for(var item in following){
				followingCount = following[item].user.friends_count;
				name = following[item].user.name;
				screen_name = following[item].user.screen_name;
				profileImage = following[item].user.profile_image_url;
			}
			mainArr.push(followingCount);
			mainArr.push(name);
			mainArr.push(screen_name);
			mainArr.push(profileImage);
			resolve(mainArr);
		});
	});
};

//function that is sent out from this module to be used in index.js in the routes folder
function sendData(callback){
	getTimeLine().then(function(mainArr){
		return getFollowing(mainArr);
	}).then(function(mainArr){
		return getRecMessage(mainArr);
	}).then(function(mainArr){
		return getSentMessage(mainArr);
	}).then(function(mainArr){
		return getFollowingCount(mainArr);
	}).then(function(mainArr){
		//intercepting the mainArr to make the getRecMessage and getSentMessage Objects in a order by timestamp
		//creating some temporary arrays to manipulate the 3rd and 4th elements of the mainArr
		var tempMainArr = [];
		var tempArr1 = mainArr[2];
		var tempArr2 = mainArr[3];
		tempMainArr = tempArr1.concat(tempArr2);
		//the actual sorting function
		tempMainArr.sort(function(x, y){
		    return y.sentTimestamp - x.sentTimestamp;
		});
		//create a new array with 7 elements, the third element now being a collection of direct messages from and to the user
		//The last four elements hold the following count, name, screen name and the profile image of the user respectively
		var newMainArr = [mainArr[0],mainArr[1],tempMainArr,mainArr[4],mainArr[5],mainArr[6],mainArr[7]];
		//send the newMainArr out with the callback fucnction
		callback(null,newMainArr);
	}).catch(function(error){
		//if there is an error, send an error with the callback function
		callback(error);
	});
}


module.exports = sendData;









