/**
    * Copyright (c) 2014 Aaron Landy
    * This code is the property of Aaron Landy and can not be copied
    * or redistributed without permission.
    *
    * Author(s):
    * -------
    * Aaron Landy (aaron@thecompassmag.com)
    *
    *
*/

var express = require('express');
var connect = require('connect');
var http = require('http');
var path = require('path');
var crypto = require('crypto');
var Facebook = require('fb');
var Step = require('step');
var request = require('request');
var sendgrid  = require('sendgrid')('crystal1', 'hacktnw');

var mongoose = require('mongoose');

var io = require('socket.io');

var app = express();
var server = http.createServer(app);

//render html files instead of ejs files.
app.engine('html', require('ejs').renderFile);

var portNumber = 5000;
var port = process.env.PORT || portNumber;
app.configure(function(){
  app.set('port', port);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'html');
  app.set('view options', {layout: false});
  app.use(connect.cookieParser('cookieKey81472321530089'));
  app.use(connect.session({
    secret: 'sessionSecretKey1238147530089',
    cookie: {maxAge : 7200000} // Expiers in 2 hours
    }));
  app.use(express.bodyParser());
  app.use(express.favicon()); 
  app.use(express.methodOverride());


app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.use(function(req, res, next){
  // the status option, or res.statusCode = 404
  // are equivalent, however with the option we
  // get the "status" local available as well
  res.render('404', { status: 404, url: req.url });

});

app.use(function(req, res, next){
    res.render('500', {
      status: err.status || 500
    , error: err
  });

});

app.configure('development', function(){
  app.use(express.errorHandler());
});

var FB = require('fb');

appId = '1405415783045648';
appSecret = 'fc53d97aba6d4a7f605c8f7027595c24';

var config = { };

// should end in /
config.rootUrl  = process.env.ROOT_URL                  || 'http://localhost:5000/';

config.facebook = {
    appId:          process.env.FACEBOOK_APPID          || '1405415783045648',
    appSecret:      process.env.FACEBOOK_APPSECRET      || 'fc53d97aba6d4a7f605c8f7027595c24',
    appNamespace:   process.env.FACEBOOK_APPNAMESPACE   || 'identifier',
    redirectUri:    process.env.FACEBOOK_REDIRECTURI    ||  config.rootUrl + 'login/callback'
};

FB.options({
    appId:          config.facebook.appId,
    appSecret:      config.facebook.appSecret,
    redirectUri:    config.facebook.redirectUri
});

https://www.facebook.com/dialog/oauth?response_type=code&scope=user_about_me&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Flogin%2Fcallback&client_id=1405415783045648

var mongoose = require('mongoose');

// DB connection 
// Collection: tickfinity
// username: aaron 
// password: abc123

// For testing locally:
// mongoose.connect('mongodb://localhost/tickfinity');

// For testing production:
mongoose.connect('mongodb://localhost/fbenv');

var db = mongoose.connection;

// Error handling
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function callback() {
  console.log('Connected to DB');
});

var User = mongoose.model('User', { 
  _id: String,
  firstName: String,
  lastName: String,
  address: String,
  cellNumber: String,
  email: String,
  password: String,
  friendsList : [],
  feed : String
});

var userObject = {};

var findFriends = function(req, res) {
  var friendsList = []
  FB.api('me/friends', {fields:'name, picture', limit:10050,access_token:req.session.access_token}, function (result) {
      if(!result || result.error) {
          return null
          console.log(null);
      }
      if(result) {
        console.log(result);
        return result;
        /*for(var i in result['data']) {
          friendsList.push(result['data'][i]);
        }
        */
        
      }
  });
  
}

var getFacebookData = function(req, type, access_token, callback) {
  var url = 'https://graph.facebook.com/me/' + type + '?access_token=' + access_token + "&height=200&type=normal&width=200";
  if(type === 'picture') {
    request(url, function (error, response, body) {
      if(error) {
        console.log(error);
      }
      else {
          var destUrl = this.redirects[this.redirects.length-1].redirectUri;
          callback(destUrl);
      }
    });
  }
  else if(type==='friends') {
    var url = 'https://graph.facebook.com/me/' + type + '?access_token=' + access_token + "&fields=name,picture";
    request(url, function (error, response, body) {
      if(error) {
        console.log(error);
      }
      else {

        callback(body);
      }
    });
  }
  else {
    request(url, function (error, response, body) {
      if(error) {
        console.log(error);
      }
      else {

        callback(body);
      }
    });
  }
}


app.get('/', function(req, res) {
  var accessToken = req.session.access_token;
  if(!accessToken) {
      res.render('facebook', {
          //loginUrl: FB.getLoginUrl({ scope: 'email, user_about_me, user_activities, user_birthday, user_checkins, user_education_history, user_events, user_hometown, user_interests, user_likes, user_location, user_notes, user_photos, user_questions, user_relationships, user_relationship_details, user_religion_politics, user_status, user_subscriptions, user_videos, user_website, user_work_history, friends_about_me, friends_activities, friends_birthday, friends_checkins, friends_education_history, friends_events, friends_groups, friends_hometown, friends_interests, friends_likes, friends_location, friends_notes, friends_photos, friends_questions, friends_relationships, friends_relationship_details, friends_religion_politics, friends_status, friends_subscriptions, friends_videos, friends_website, friends_work_history, read_friendlists, read_mailbox'})
          profileData : ''
      });
  } else {
      var user = {

      };
      var info = {};
      getFacebookData(req, '', accessToken, function(userData) {
        var userData = JSON.parse(userData);
        user.profileData = userData;
        console.log(userData);
        console.log('name : ' + userData.name);
        info.name = userData.name;
        getFacebookData(req, 'friends', accessToken, function(userFriends) {
          var userFriends = JSON.parse(userFriends);
          user.friends = userFriends
          // user.amtOfFriends = userFriends.data.length;
          getFacebookData(req, 'likes', accessToken, function(userLikes) {
            var userLikes = JSON.parse(userLikes);
            user.userLikes = userLikes
            console.log('likes.');
            getFacebookData(req, 'movies', accessToken, function(userMovieLikes) {
              user.movieLikes = JSON.parse(userMovieLikes);
              console.log('movies.');
              getFacebookData(req, 'music', accessToken, function(userMusicLikes) {
                user.musicLikes = JSON.parse(userMusicLikes);
                console.log('music.');
                getFacebookData(req, 'books', accessToken, function(userBookLikes) {
                  user.bookLikes = JSON.parse(userBookLikes);
                  console.log('books.');
                  getFacebookData(req, 'photos', accessToken, function(userPhotoTags) {
                    user.photoTags = JSON.parse(userPhotoTags);
                    console.log('photos.');
                    //getFacebookData(req, 'books', accessToken, function(userVideoTags) {
                      //user.videoTags = userVideoTags;
                      getFacebookData(req, 'locations', accessToken, function(userLocations) {
                        user.locations = userLocations
                        console.log('locations.');
                        getFacebookData(req, 'picture', accessToken, function(userProfilePicture) {
                          user.picture = userProfilePicture;
                          console.log('pictures');
                          console.log()
                          if(user.friends.data.length > 150 || user.profileData.verified === true) {
                            var probability = '99%';
                          }
                          else {
                            var probability = '80%'
                          }

                         

                          res.render('facebook', {
                            user : user,
                            name : info.name,
                            fbLink : user.profileData.link,
                            website : user.profileData.website,
                            verified : user.profileData.verified,
                            hometown : user.profileData.hometown.name,
                            picture : user.picture,
                            gender : user.profileData.gender,
                            birthday : user.profileData.birthday,
                            email : user.profileData.email,
                            profileData : user.profileData,
                            position : user.profileData.work[0].position.name,
                            company : user.profileData.work[0].employer.name,
                            friendsList : user.friends.data,
                            amtOfFriends : user.friends.data.length,
                            amtOfLikes : user.userLikes.data.length,
                            amtOfMovies : user.movieLikes.data.length,
                            amtOfMusic : user.musicLikes.data.length,
                            amtOfBooks : user.bookLikes.data.length,
                            photoTags : undefined,
                            probability : probability

                          });
                        });
                     // });
                    });                      
                  });
                });
              });
            });
            
          });
        });

      });
  }
});

app.get('/rawdata', function(req, res) {
  var accessToken = req.session.access_token;
  if(!accessToken) {
      res.render('facebook', {
          //loginUrl: FB.getLoginUrl({ scope: 'email, user_about_me, user_activities, user_birthday, user_checkins, user_education_history, user_events, user_hometown, user_interests, user_likes, user_location, user_notes, user_photos, user_questions, user_relationships, user_relationship_details, user_religion_politics, user_status, user_subscriptions, user_videos, user_website, user_work_history, friends_about_me, friends_activities, friends_birthday, friends_checkins, friends_education_history, friends_events, friends_groups, friends_hometown, friends_interests, friends_likes, friends_location, friends_notes, friends_photos, friends_questions, friends_relationships, friends_relationship_details, friends_religion_politics, friends_status, friends_subscriptions, friends_videos, friends_website, friends_work_history, read_friendlists, read_mailbox'})
          profileData : ''
      });
  } else {
      var user = {

      };
      var info = {};
      getFacebookData(req, '', accessToken, function(userData) {
        var userData = JSON.parse(userData);
        user.profileData = userData;
        console.log(userData);
        console.log('name : ' + userData.name);
        info.name = userData.name;
        getFacebookData(req, 'friends', accessToken, function(userFriends) {
          var userFriends = JSON.parse(userFriends);
          user.friends = userFriends
          // user.amtOfFriends = userFriends.data.length;
          getFacebookData(req, 'likes', accessToken, function(userLikes) {
            var userLikes = JSON.parse(userLikes);
            user.userLikes = userLikes
            console.log('likes.');
            getFacebookData(req, 'movies', accessToken, function(userMovieLikes) {
              user.movieLikes = JSON.parse(userMovieLikes);
              console.log('movies.');
              getFacebookData(req, 'music', accessToken, function(userMusicLikes) {
                user.musicLikes = JSON.parse(userMusicLikes);
                console.log('music.');
                getFacebookData(req, 'books', accessToken, function(userBookLikes) {
                  user.bookLikes = JSON.parse(userBookLikes);
                  console.log('books.');
                  getFacebookData(req, 'photos', accessToken, function(userPhotoTags) {
                    user.photoTags = JSON.parse(userPhotoTags);
                    console.log('photos.');
                    //getFacebookData(req, 'books', accessToken, function(userVideoTags) {
                      //user.videoTags = userVideoTags;
                      getFacebookData(req, 'locations', accessToken, function(userLocations) {
                        user.locations = userLocations
                        console.log('locations.');
                        getFacebookData(req, 'picture', accessToken, function(userProfilePicture) {
                          user.picture = userProfilePicture;
                          console.log('pictures');
                          console.log()
                          if(user.friends.data.length > 150 || user.profileData.verified === true) {
                            var probability = '99%';
                          }
                          else {
                            var probability = '80%';
                          }

                          res.send(user);
                        });
                     // });
                    });                      
                  });
                });
              });
            });
            
          });
        });

      });
  }
});

app.get('/ngrok', function(req, res) {
  res.render('ngrok');
});

app.get('/login/callback', function(req, res) {
    var code            = req.query.code;
    console.log(code);

    if(req.query.error) {
        // user might have disallowed the app
        return res.send('login-error ' + req.query.error_description);
    } else if(!code) {
        return res.redirect('/');
    }

    Step(
        function exchangeCodeForAccessToken() {
            FB.napi('oauth/access_token', {
                client_id:      FB.options('appId'),
                client_secret:  FB.options('appSecret'),
                redirect_uri:   FB.options('redirectUri'),
                code:           code
            }, this);
        },
        function extendAccessToken(err, result) {
            if(err) throw(err);
            FB.napi('oauth/access_token', {
                client_id:          FB.options('appId'),
                client_secret:      FB.options('appSecret'),
                grant_type:         'fb_exchange_token',
                fb_exchange_token:  result.access_token
            }, this);
        },
        function (err, result) {
            if(err) return next(err);

            req.session.access_token    = result.access_token;
            req.session.expires         = result.expires || 0;

            if(req.query.state) {
                var parameters              = JSON.parse(req.query.state);
                parameters.access_token     = req.session.access_token;

                FB.api('/me/' + config.facebook.appNamespace +':eat', 'post', parameters , function (result) {
                    console.log(result);
                    if(!result || result.error) {
                        return res.send(500, result || 'error');
                        // return res.send(500, 'error');
                    }

                    return res.redirect('/');
                });



            } else {
                return res.redirect('/');
            }
        }
    );
});


app.get('/findFriends',function(req, res) {
  FB.api('me/friends', {
        fields:         'name,picture,friends',
        limit:          250,
        access_token:   req.session.access_token
    }, function (result) {
        if(!result || result.error) {
            return res.send(500, 'error');
        }
        res.send(result);
    });
});
app.get('/logout', function(req, res) {
  req.session = null; // clear session
  res.redirect('/');
});

app.get('/user/:id', function(req, res) {
  var userid = req.params.id;
  //'birthday', 'education', 'cover', 'email', 'favorite_athletes', 'is_verified', 'username', 'verified', 'website', 'work's
  FB.api(userid, { fields: ['id', 'age_range', 'name', 'bio',  ] }, function (response) {
    if(!response || response.error) {
      console.log(!response ? 'error occurred' : response.error);
      return;
    }
    res.send(response);
  });

});

app.get('/feed/:id', function(req, res) {
  var data = getFacebookData(req, res, req.params.id, 'feed', req.session.access_token);
  res.send(data);

});

app.get('/batch', function(req, res){


  FB.api('', 'post', {
    batch: [{ method: 'get', relative_url: 'me/friends?limit=100'}]
  }, function(response) {
    
    res.send(response);
  });
});

// Start the server.
server.listen(portNumber, function(req, res) {
    console.log('listening on port ' + portNumber);
});