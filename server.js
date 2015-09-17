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
    sqlite3 = require('sqlite3').verbose(),
    config = require('./config'),
    exitHandlers = require('./exitHandler');

// Constants
var WORKPLACE_REGEX = /[^a-zA-Z0-9 ,']/;
var TAGS_REGEX = /[^a-z0-9, ]/;

/**
 * When this is set to a value it should be returned instead of querying the
 * database. Whenever the database is updated this value should be set to null.
 */
var databaseCache = null;

// Create or access the database
var db = new sqlite3.Database(config.DATABASE, function() {
    console.log('Database open');
    initDatabase();
});

// Close the database before we exit
exitHandlers.push(function () {
    db.close();
});

// Create the express handler and server
var app = express();
var server = require('http').Server(app);

// Serve files in the static directory at /static/<file>
app.use('/static', express.static('static'));

// enable bodyParser
app.use(bodyParser.urlencoded({
    extended: true
}));


/**
 * Handle GET requests for the current data stored in the database.
 */
app.get('/data/json', function(req, res) {
    if (databaseCache != null) {
        return res.end(databaseCache);
    } else {
        db.all('SELECT * FROM ' + config.TABLE, function(err, rows) {
            if (err) {
                console.error(err);
                var result = { error: err };
                res.status(500).end(JSON.stringify(result));
            } else {
                var result = { people: rows };
                databaseCache = JSON.stringify(result);
                return res.end(databaseCache);
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
    var INSERT_STATEMENT = 'INSERT INTO ' + config.TABLE + ' \
(lat, lng, name, workplace, tags) VALUES (?1, ?2, ?3, ?4, ?5)';
        
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
        databaseCache = null;
        db.run(INSERT_STATEMENT, [lat, lng, name, workplace, tags]);
        return res.redirect(SUCCESS_URL);
    }
});


// Finally actually begin listening on remote ports
server.listen(config.PORT, function() {
    console.log('Server listening on *:' + config.PORT);
});


/**
 * Initialize the database by creating tables.
 */
function initDatabase() {
    var statement = 'CREATE TABLE IF NOT EXISTS ' + config.TABLE + ' (\
id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, lat FLOAT, lng FLOAT, \
name VARCHAR(100) NOT NULL, workplace VARCHAR(100) NOT NULL, \
tags VARCHAR(255) NOT NULL)';
    db.run(statement);
}
