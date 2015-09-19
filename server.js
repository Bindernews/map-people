/*
    Map-People

    Copyright (c) 2015, Drew Heintz. All rights reserved.
    Use of this source code is governed by the MIT License, which can be found
    in the LICENSE.txt file.
 */

var path = require('path'),
    fs = require('fs'),
    express = require('express'),
    bodyParser = require('body-parser'),
    config = require('./config'),
    exitHandlers = require('./exitHandler');


// Constant regexes
var WORKPLACE_REGEX = /[^a-zA-Z0-9 ,']/;
var TAGS_REGEX = /[^a-z0-9, ]/;


// First we need to initalize the backend
var backend = require('./backends/' + config.BACKEND);
// Allow it to initialize
backend.init();
// Make sure the backend has a chance to shutdown when we close
exitHandlers.push(function() {
    backend.close();
});


/**
 * When this is set to a value it should be returned instead of querying the
 * backend. Whenever the backend is updated this value should be set to null.
 */
var backendCache = null;

// Create the express handler and server
var app = express();
var server = require('http').Server(app);

// Serve files in the static directory at /static/<file>
app.use('/static', express.static('static'));

// enable bodyParser
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/', function(req, res) {
    res.redirect('/static/index.html');
});

/**
 * Handle GET requests for the current data stored in the database.
 */
app.get('/data/json', function(req, res) {
    if (backendCache != null) {
        return res.end(backendCache);
    } else {
        backend.getPeople(function (err, people) {
            if (err) {
                console.error(err);
                var result = { error: err };
                res.status(500).end(JSON.stringify(result));
            } else {
                var result = { people: people };
                backendCache = JSON.stringify(result);
                return res.end(backendCache);
            }
        });
    }
});


/**
 * Handles posts to /data/newpoint which will create new data points.
 */
app.post('/data/newpoint', function(req, res) {
    // constants
    var FORM_URL = '/static/newpoint.html?';
    var SUCCESS_URL = '/static/point_created.html';
        
    // verify data is valid
    var lat = parseFloat(req.body.lat),
        lng = parseFloat(req.body.lng),
        name = req.body.name || '',
        workplace = req.body.workplace || '',
        tags = req.body.tags || '';
    
    // sanitize inputs with regexes
    workplace = workplace.replace(WORKPLACE_REGEX, '');
    tags = tags.toLowerCase().replace(TAGS_REGEX, '');
    
    // 
    if (isNaN(lat) || isNaN(lng) || name == '' || workplace == ''
        || tags == '') {
        var redirectURL = FORM_URL;
        if (lat != NaN) {
            redirectURL += 'lat=' + lat;
        }
        if (lng != NaN) {
            redirectURL += '&lng=' + lng;
        }
        redirectURL += '&error=Invalid form fields';
        return res.redirect(redirectURL);
    } else {
        // TODO map tags to set list of tags
        backendCache = null;
        backend.createPerson(lat, lng, name, workplace, tags);
        return res.redirect(SUCCESS_URL);
    }
});


// Finally actually begin listening on remote ports
server.listen(config.PORT, function() {
    console.log('Server listening on *:' + config.PORT);
});


