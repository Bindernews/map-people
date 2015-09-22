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
var EMAIL_REGEX = /[\w\+\.]+@[\w\.]+/;


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
app.use(bodyParser.json());
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
 * This endpoint receives a JSON body and creates a new data point from
 * the given data. It sends back a json response.
 */
app.post('/data/newpoint/json', function(req, res) {
    // verify data is valid
    var lat = parseFloat(req.body.lat),
        lng = parseFloat(req.body.lng),
        name = req.body.name || '',
        email = req.body.email || '',
        workplace = req.body.workplace || '',
        tags = req.body.tags || '';
    
    // sanitize inputs with regexes
    workplace = workplace.replace(WORKPLACE_REGEX, '');
    tags = tags.toLowerCase().replace(TAGS_REGEX, '');
    
    // store the JSON result in this
    var result;
    
    if (isNaN(lat) || isNaN(lng) || name == '' || !EMAIL_REGEX.test(email)
        || workplace == '' || tags == '') {
        result = {
            success: false,
            error: 'Invalid field(s)',
        };
    } else {
        // TODO map tags to set list of tags
        backendCache = null;
        backend.createPerson(lat, lng, name, email, workplace, tags);
        result = {
            success: true,
        };
    }
    return res.end(JSON.stringify(result));
});


// Finally actually begin listening on remote ports
server.listen(config.PORT, function() {
    console.log('Server listening on *:' + config.PORT);
});


