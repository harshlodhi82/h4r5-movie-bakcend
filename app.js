var express = require("express");
var bodyParser = require("body-parser");
var model = require('./models/models');
var formidable = require('formidable');


var app = express();
var PORT = process.env.PORT || 8000;

app.use((req, res, next) => {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});
app.use(express.static('uploads/movie-images'));
// app.use(express.static(''));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.get("/", (req, res) => {
    debugger
    res.send("Hello");
});

/////User Apis////////

///create user
app.post("/createuser", (req, res) => {
    var fname = req.body.fname;
    var lname = req.body.lname;
    var _email = req.body.email;
    var pass = req.body.password;
    var _country = req.body.country;
    var likedMov = [];
    var dislikedMov = [];
    var myRates = [];


    var _newUser = new model.UserSchema({
        firstName: fname,
        lastName: lname,
        email: _email,
        password: pass,
        country: _country,
        likedMovies: likedMov,
        dislikedMovies: dislikedMov,
        myRatings: myRates
    });

    _newUser.save()
        .then((doc) => {
            // console.log("data sent!!");
            res.send(doc);
        }).catch((err) => {
            res.send({ "msg": "User Already Exist!" })
        });
});

///validate email
app.get("/validate/email/:email/:pass/:flag", (req, res) => {
    var query_email = req.params.email;
    var query_pass = req.params.pass;
    var query_flag = req.params.flag;


    if (query_flag == 0) {
        // check login

        model.UserSchema.find({
            "email": query_email,
            "password": query_pass
        }, (err, data) => {
            if (data.length == 0) {
                res.send({ "valid": false });
            } else {
                res.send({ "valid": true });
            }

        });

    } else if (query_flag == 1) {
        //check signUp

        model.UserSchema.find({
            "email": query_email
        }, (err, data) => {
            if (data.length == 0) {
                //email not exist 

                res.send({ newUser: true });
            } else {
                //email exist
                res.send({ newUser: false });
            }

        });
    }






});


///get user Data
app.post("/getData/email/", (req, res) => {
    var query_email = req.body.email.trim();

    model.UserSchema.find({ "email": query_email }, (err, data) => {
        res.send(data);
    })

});

//get user name by ID:

app.post("/get/username", (req, res) => {
    var usrID = req.body.usrID.trim();

    var query = {_id : usrID};

    model.UserSchema.findOne(query, (err, data) => {
        var fname = data["firstName"];
        var lname = data["lastName"];

        var resData = {
            firstName: fname,
            lastName: lname 
        };

        res.send(resData);
    })

});


/////////////////////////////////////////////////////////

///movies Apis

//add movie review
app.post("/add/movie", (req, res) => {
    var _name;
    var _imageName;
    var _info;
    var _review;
    var _reviewrId;
    var _date = new Date();

    var form = new formidable.IncomingForm();
    form.parse(req, (err, field, files) => {
        if (err) {
            console.error('Error', err)
            res.send({ "ok": false });
        }
        // console.log(files.file.name);
        _name = field.name.toString().trim();
        _info = field.movInfo.toString().trim();
        _review = field.movReview.toString().trim();
        _reviewrId = field.reviewerID.toString().trim();


        var arr = files.file.name.split(".");
        var formate = arr[arr.length - 1];
        var tsName = Math.floor(Date.now() / 1000).toString() + "." + formate;

        _imageUrl = "http://localhost:8000/" + tsName;

        var movie = new model.MovieSchema({
            name: _name,
            imageUrl: _imageUrl,
            review: _review,
            info: _info,
            ratings: {
                users: 0,
                rating: 0
            },
            likes: 0,
            dislikes: 0,
            date: _date,
            reviewer: _reviewrId
        });

        movie.save().then((doc) => {
            res.send(doc);
        }).catch((err) => {
            if(err){
                console.log(err);
                
            }
            res.send({ "msg": "Movie Not added" })
        });





    }).on('fileBegin', (name, file) => {
        var arr = file.name.split(".");
        var formate = arr[arr.length - 1];
        var tsName = Math.floor(Date.now() / 1000).toString() + "." + formate;
        // console.log(tsName);
        file.path = __dirname + '/uploads/movie-images/' + tsName;
    });


});

//get Movie by ID
app.get("/get/movie/:id", (req, res) => {

    var movID = req.params.id;

    model.MovieSchema.find({ _id: movID }, (err, data) => {
        // console.log(data);
        res.send(data);
    });
})


//get All movies
app.get("/get/movies", (req, res) => {
    model.MovieSchema.find({}, (err, data) => {
        // console.log(data);
        res.send(data);
    });
})

//update liked movies
app.put("/update/likedmovies", (req, res) => {
    var movieId = req.body.movID;
    var userID = req.body.uID;
    var query = { "_id": userID };

    model.UserSchema.find(query, (err, data) => {
        // console.log(data[0]["likedMovies"]);
        console.log(data);

        var arr = data[0]["likedMovies"];

        arr.push(movieId);
        newData = { likedMovies: arr };

        model.UserSchema.update(query, newData, { upsert: true }, (err, data) => {
            // console.log("Data Updated!!");
            res.send(data);
        })


    })
});

//update disliked movies
app.put("/update/dislikedmovies", (req, res) => {
    var movieId = req.body.movID;
    var userID = req.body.uID;
    var query = { "_id": userID };

    model.UserSchema.find(query, (err, data) => {
        // console.log(data[0]["likedMovies"]);
        var arr = data[0]["dislikedMovies"];

        arr.push(movieId);
        newData = { dislikedMovies: arr };

        model.UserSchema.update(query, newData, { upsert: true }, (err, data) => {
            // console.log("Data Updated!!");
            res.send(data);
        })


    })
});

///update likes/dislikes
app.put("/update/:flag", (req, res) => {
    var flag = req.params.flag;
    var movID = req.body.movID;

    var query = { "_id": movID }
    model.MovieSchema.find(query, (err, data) => {
        // console.log(data);

        var likes = data[0].likes;
        var dislikes = data[0].dislikes;
        var newData = {};

        if (flag == "likes") {
            likes += 1;
            newData = { "likes": likes };

        } else if (flag == "dislikes") {
            dislikes += 1;
            newData = { "dislikes": dislikes };
        }



        model.MovieSchema.update(query, newData, (err, msg) => {
            res.send(data)
        })


    })
});

///update and remove liked/disliked movies
app.put("/update/rm/:flag", (req, res) => {
    var flag = req.params.flag;
    var movID = req.body.movID.trim();
    var usrID = req.body.usrID.trim();


    // console.log(">>>", movID);

    var query = { "_id": usrID };


    model.UserSchema.find(query, (err, data) => {

        var likedMovie = data[0].likedMovies;
        var dislikedMovie = data[0].dislikedMovies;


        var newData = {};
        var arr = [];



        if (flag == "likedmovies") {
            // console.log("running");

            likedMovie.forEach((_movID) => {
                // console.log(_movID);
                if (_movID != movID) {
                    arr.push(_movID);
                }
            });
            // console.log(arr);
            newData = { "likedMovies": arr };

        } else if (flag == "dislikedmovies") {

            dislikedMovie.forEach((_movID) => {
                if (_movID != movID) {
                    arr.push(_movID);
                }
            });


            newData = { "dislikedMovies": arr };
        }

        // console.log(newData);

        model.UserSchema.update(query, newData, function (err, msg) {
            res.send(data)
        });
    })
});

///load more data api
app.get("/getdata/:skip/:limit", (req, res) => {
    var limit = eval(req.params.limit);
    var skip = eval(req.params.skip);

    model.MovieSchema.find({}, (err, data) => {
        // console.log(data);
        res.send(data);
    })
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit);

});


///Search data api
app.get("/search/:query", (req, res) => {
    var query = "(?i).*" + req.params.query + ".*";
    console.log("hey",query);
    

    model.MovieSchema.find({ "name": { $regex: query } }, (err, data) => {
        console.log(data);
        if(err){
            console.log(err);
            
        }
        res.send(data);
    })
        .sort({ _id: -1 });
});



///// on one like or dislike
app.get("/update/:flag/:usrId/:movId", (req, res) => {
    var flag = eval(req.params.flag);
    var usrId = req.params.usrId;
    var movId = req.params.movId;

    var ldCheck = false;

    var checkAlreadyLike = false;
    var checkAlreadyDislike = false;


    var query = { _id: usrId };
    var query2 = { _id: movId };

    ///
    model.UserSchema.findOne(query, (err, data) => {
        var likedMovie = [];
        var dislikedMovies = [];

        if (data["likedMovies"]) {
            likedMovie = data["likedMovies"];
        }

        if (data["dislikedMovies"]) {
            dislikedMovies = data["dislikedMovies"];
        }

        var newData = {};
        if (flag === 1) {

            if (dislikedMovies.includes(movId)) {
                checkAlreadyDislike = true;
            }

            dislikedMovies.push(movId);
            var _set = new Set(dislikedMovies);
            var newDislikedArr = Array.from(_set);

            if (likedMovie.includes(movId)) {
                var index = likedMovie.indexOf(movId);
                likedMovie.splice(index, 1);
                ldCheck = true;
            }

            newData = {
                likedMovies: likedMovie,
                dislikedMovies: newDislikedArr
            };

        } else if (flag === 2) {

            if (likedMovie.includes(movId)) {
                checkAlreadyLike = true;
            }

            likedMovie.push(movId);
            var _set = new Set(likedMovie);
            var newLikedArr = Array.from(_set);


            if (dislikedMovies.includes(movId)) {
                var index = dislikedMovies.indexOf(movId);
                dislikedMovies.splice(index, 1);
                ldCheck = true;
            }

            newData = {
                likedMovies: newLikedArr,
                dislikedMovies: dislikedMovies
            };
        }

        model.UserSchema.updateOne(query, newData, (err, _data) => {

            // console.log(_data);

            // res.send(_data);

        });

        ////
        model.MovieSchema.findOne(query2, (err, movData) => {
            var like = movData["likes"];
            var dislike = movData["dislikes"];

            if (flag === 1) {
                if (!checkAlreadyDislike) {
                    dislike += 1;
                    if (ldCheck) {
                        like -= 1;
                    }

                }


            } else if (flag === 2) {
                if (!checkAlreadyLike) {
                    like += 1;
                    if (ldCheck) {
                        dislike -= 1;
                    }

                }

            }

            var newData = {
                likes: like,
                dislikes: dislike
            };

            model.MovieSchema.updateOne(query2, newData, (err, upData) => {
                res.send({ "Ok": true });
            });
        });

    });
    ///



    ////
});

app.get("/get/bundal/ld/:usrId/:movId", (req, res) => {

    var usrId = req.params.usrId;
    var movId = req.params.movId;

    var query = { _id: usrId };
    var query2 = { _id: movId };
    model.UserSchema.findOne(query, (err, udata) => {
        model.MovieSchema.findOne(query2, (err, mdata) => {
            var userLikedArray = udata["likedMovies"];
            var userDislikedArray = udata["dislikedMovies"];
            var movieLikes = mdata["likes"];
            var movieDisikes = mdata["dislikes"];

            var resData = {
                uLArray: userLikedArray,
                uDArray: userDislikedArray,
                mLikes: movieLikes,
                mDislikes: movieDisikes
            };

            res.send(resData);
        });
    });
});

///Rating:

app.get("/rate/:usrId/:movId/:rating", (req, res) => {
    var rate = eval(req.params.rating);
    var userId = req.params.usrId;
    var movId = req.params.movId;

    var movQuery = { _id: movId };
    var usrQuery = { _id: userId };
    model.UserSchema.findOne(usrQuery, (err, usrData) => {

        var usrRatingArr = usrData["myRatings"];

        var prevRate = 0;
        var isRated = false;

        var flag = false;
        for (var i = 0; i < usrRatingArr.length; i++) {
            if (movId in usrRatingArr[i]) {
                prevRate = usrRatingArr[i][movId];

                usrRatingArr[i][movId] = rate;

                

                flag = true;
                isRated = true;
                break;
            }
        }

        if (!flag) {
            var nd = {};
            nd[movId] = rate;
            usrRatingArr.push(nd);
        }

        var newData = { myRatings: usrRatingArr };

        model.UserSchema.updateOne(usrQuery, newData,(err,msg)=>{
            // console.log(msg);/

        });

        // console.log(isRated);

        model.MovieSchema.findOne(movQuery, (err, movData) => {
            // console.log(movData["ratings"]);
            var ratingsObj = movData["ratings"];
            var users = ratingsObj["users"];
            var ratings = ratingsObj["rating"];

            var newRating = ratings;
            var pluses = ratings*users;

            if (!isRated) {
                users += 1;
                newRating = (pluses+rate)/users ;
            }else{
                pluses = pluses - prevRate;
                newRating = (pluses+rate)/users ;
            }

            var newData = {
                ratings: {
                    "users": users,
                    "rating": newRating
                }
            };

            var resData = {
                movRatings: {
                    "users": users,
                    "rating": newRating
                },
                userRatings: usrRatingArr
            };
            
            model.MovieSchema.updateOne(movQuery, newData, (err, msg) => {
                res.send(resData);
            });
        });

        // res.send({ok:true});



    });
});


app.listen(PORT, (err) => {
    console.log("Server is connected at port:", PORT);
})
