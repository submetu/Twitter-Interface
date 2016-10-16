var Twitter = require('twitter');
var ta = require('time-ago')();
var client = new Twitter({
  consumer_key: "6H4QFi6LbYkwP8Lqy4eB5Fh2h",
  consumer_secret: "M4qsazGkVcuONLbpO2MwKEKgk3A9FwbFEy6Xylazig9SFBZ3pH",
  access_token_key: "731891686738149376-By8uMKEZerOgHuVXCsXRUoQwVbmT0Tx",
  access_token_secret: "23OD5bajMH26DNndmi1d6hi04VB8ArQr7SlV1pCcVVUhh"
});
var TimelineObject = {
	createdAt:null,
	name:null,
	screenName:null,
	tweet:null,
	retweetCount:null,
	favoriteCount:null,
	profileImage:null
}
var FollowingObject = {
	name:null,
	screenName:null,
	profileImage:null
}
var MessageObject = {
	message:null,
	senderName:null,
	senderImage:null,
	sentTimestamp:null,
	sentTimeAgo:null
}
//Get Timeline
client.get('statuses/home_timeline', {screen_name: 'MetuSub', count :5}, function(error, tweets, response) {
	var TimelineArr=[];
	for (var tweet in tweets){
		var testObject = Object.create(TimelineObject);
		var tweetDate = tweets[tweet].created_at;
		var newtweetDate = new Date(tweetDate);
		newtweetDate= Date.parse(newtweetDate);
		newtweetDate = ta.ago(newtweetDate);
		testObject.createdAt= newtweetDate;
		testObject.name=tweets[tweet].user.name;
		testObject.screenName=tweets[tweet].user.screen_name;
		testObject.tweet=tweets[tweet].text;
		testObject.retweetCount=tweets[tweet].retweet_count;
		testObject.favoriteCount=tweets[tweet].favorite_count;
		testObject.profileImage=tweets[tweet].user.profile_image_url;
		TimelineArr.push(testObject);
	} 
	//console.log(TimelineArr);
});
//Get Following
client.get('friends/list', {screen_name: 'MetuSub', count :5}, function(error, following, response) {
	var followingArr = [];
	followingArr = following.users.map(function(item){
		var testObject = Object.create(FollowingObject);
		testObject.name = item.name;
		testObject.screenName = item.screen_name;
		testObject.profileImage = item.profile_image_url;
		return testObject;
	});
	//console.log(followingArr)
	
});
//received direct message
client.get('direct_messages', {count :5}, function(error, message, response) {
	var recMsgArr = [];
	recMsgArr = message.map(function(item){
		var testObject = Object.create(MessageObject);
		testObject.message = item.text;
		testObject.senderName = item.sender.name;
		testObject.senderImage = item.sender.profile_image_url;
		var newTime = new Date(item.created_at);
		testObject.sentTimestamp = Date.parse(newTime);
		testObject.sentTimeAgo = ta.ago(newTime);
		return testObject;
	});
	console.log(recMsgArr);
});

//Sent direct message
client.get('direct_messages/sent', {count :5}, function(error, message, response) {
	var sentMsgArr = [];
	sentMsgArr = message.map(function(item){
		var testObject = Object.create(MessageObject);
		testObject.message = item.text;
		testObject.senderName = item.sender.name;
		testObject.senderImage = item.sender.profile_image_url;
		var newTime = new Date(item.created_at);
		testObject.sentTimestamp = Date.parse(newTime);
		testObject.sentTimeAgo = ta.ago(newTime);
		testObject.recName = item.recipient.name;
		return testObject;
	});
	console.log(sentMsgArr);
});

