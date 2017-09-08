//parsing json string<-->objects
var bodyParser = require('body-parser');
//firebase duh
const functions = require('firebase-functions');
//make api calls
var request = require('request');
//to deal with json data
var S = require('string');
//node.js framework
const express = require('express');
const app = express();

//mic testing 123
app.get('/hi', (request,response) => {
    response.send("Hello world!");
});

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// Process application/json
app.use(bodyParser.json());

let FACEBOOK_APP_PASSWORD = 'messenger_bot_password';
let FACEBOOK_PAGE_ACCESS_TOKEN = "EAABozEa5xEMBAHEgEJZCnqmCcaZAxEjB8ZAmuZALcs4BcqPtD0EFpIoIsg0fUbOgjSSYtLbBby8oYcE5HJ8H27xJwZCOfMnFtMu8WB0mQZAEulBVAJ8LL4zeAJZC3rZCVGBvusZCZAZAtCiSiLZAPntTaTl7rsRCtPtiyxvbkzW8ehLe0AZDZD";

//your routes here
app.get('/hi2', function(request, response) {
    response.send("Hello World!");
});

// for Facebook verification
app.get('/webhook/', function (req, res) {
  console.log('message recieved!');
  var temp=req.query['hub.verify_token'];
  console.log(temp);
  if (req.query['hub.verify_token'] === FACEBOOK_APP_PASSWORD) {
      console.log('message validated');
      res.send(req.query['hub.challenge'])
  }
  res.send('Error, wrong token')
})

// All callbacks for Messenger will be POST-ed here
app.post("/webhook/", function (req, res) {
  console.log('in here');
   console.log(JSON.stringify(req.body));
  //1
  if (req.body.object === 'page') {
    //2
    if (req.body.entry) {
      //3
      req.body.entry.forEach(function(entry) {
        //4
        if (entry.messaging) {
          //5
          entry.messaging.forEach(function(messagingObject) {
              //6
              var senderId = messagingObject.sender.id;
              //7
              if (messagingObject.message) {
                //8
                if (!messagingObject.message.is_echo) {
                  //9
                  var inMessage = messagingObject.message.text;
                  //10
                  console.log('queryDB');
                  queryDBforAllShopsInRegion(senderId, inMessage);
                }
              }
          });
        } else {
          console.log('Error: No messaging key found');
        }
      });
    } else {
      console.log('Error: No entry key found');
    }
  } else {
    console.log('Error: Not a page object');
  }
  res.sendStatus(200);
});

function queryDBforAllShopsInRegion(senderID, inMessage)
{
  console.log('inside sendMessageToUser');
  /**example api call
   * https://ofertas-76815.firebaseio.com/shop.json/?orderBy="place"&startAt="Coimbatore"&endAt="Coimbatore"
   **/ 
  var x = 'https://ofertas-76815.firebaseio.com/shop.json/?orderBy="place"&startAt="'+inMessage+'"&endAt="'+inMessage+'"';
  console.log(x);
  request({
    url: x,
    method: 'GET'
  }, function(error, response, body) {
        if (error) {
          console.log('Error making api call ' + error);
        } else if (response.body.error){
          console.log('Error making api call' + response.body.error);
        }
        else {
          /*var y = '{"0":{"name":"a","place":"Coimbatore"},"1":{"name":"b","place":"Coimbatore"}}';
          var p = S(y).between('"','"').s;
          console.log(p);
          var pos = y.indexOf('}');
          y = y.substr(pos, (y.length-pos+1));
          console.log(y);
          p = S(y).between('"','"').s;
          console.log(p);*/
          var y = response.body;
          var array = [];
          var p;
          var pos;
         /* p = S(y).between('"','"').s;
          array.push(p);
          pos = y.indexOf('}');
          y = y.substr(pos+1, (y.length-pos));
          p = S(y).between('"','"').s;
          array.push(p);
          pos = y.indexOf('}');
          y = y.substr(pos+1, (y.length-pos));
          var z = (y.length>1);
          console.log(y +' '+ y.length+' '+z);*/
          while(y.length>1) {
            p = S(y).between('"','"').s;
            array.push(p);
            pos = y.indexOf('}')+1;
            y = y.substr(pos+1, (y.length-pos));
          }
          var i=0;
          while(i<array.length) {
          var s = queryOffersInShop(array.get(i));
          i=i+1;
          }
          sendMessageToUser(senderID, JSON.stringify(array));
        }
  });   
}

function queryOffersInShop(x) {


}

//Uses Graph API to send messages to the FB page
function sendMessageToUser(senderId, message)
{
  console.log('inside sendMessagetoUser with message '+ message);
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages?access_token=' + FACEBOOK_PAGE_ACCESS_TOKEN,
    method: 'POST',
    json: {
      recipient: {
        id: senderId
      },
      message: {
        text: message
      }
    }
  }, function (error, response, body) {
    if (error) {
      console.log('Error sending message to user: ' + error);
    } else if (response.body.error) {
      console.log('Error sending message to user: ' + response.body.error);
    }
  });
}

function showTypingIndicatorToUser(senderId, isTyping) {
  var senderAction = isTyping ? 'typing_on' : 'typing_off';
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages?access_token=' + FACEBOOK_PAGE_ACCESS_TOKEN,
    method: 'POST',
    json: {
      recipient: {
        id: senderId
      },
      sender_action: senderAction
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending typing indicator to user: ' + error);
    } else if (response.body.error){
      console.log('Error sending typing indicator to user: ' + response.body.error);
    }
  });
}

exports.app = functions.https.onRequest(app);

 //exports.helloWorld = functions.https.onRequest((request, response) => {
 //   response.send("Hello from Firebase!");
 //   });
