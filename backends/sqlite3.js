/*
    Map-People

    Copyright (c) 2015, Drew Heintz. All rights reserved.
    Use of this source code is governed by the MIT License, which can be found
    in the LICENSE.txt file.
 */

// Require things before all else
var sqlite3 = require('sqlite3'),    // sqlite3 module so we can use sqlite3
    config = require('../config');   // config because we need it


// The sqlite3 backend requires the sqlite3 node module which is why it is
// required in package.json. If you are using a different backend then you
// can safely remove that module and it won't be used.
// 
// The sqlite3 backend has a few config options which you may set. They are
// described below.
// 

// The DATABASE config option determines which database file sqlite3 will
// use. This defaults to 'db.sqlite3'
config.DATABASE = config.DATABASE || 'db.sqlite3';

// The TABLE config option specifies what table to use in the database.
// If your database has mutliple tables in it you should change this to make
// sure that it won't conflict with any other tables you have.
config.TABLE = config.TABLE || 'people';


var backend = module.exports = {};

/**
 * The actual database connection.
 */
var db;

/**
 * Initialize the database by creating tables.
 */
backend.init = function () {
    // Create or access the database
    db = new sqlite3.Database(config.DATABASE, initDatabase);
}

backend.createPerson = function (lat, lng, name, workplace, tags) {
    var INSERT_STATEMENT = 'INSERT INTO ' + config.TABLE + ' \
(lat, lng, name, workplace, tags) VALUES (?1, ?2, ?3, ?4, ?5)';
    
    databaseCache = null;
    db.run(INSERT_STATEMENT, [lat, lng, name, workplace, tags]);
}

/**
 * Get all the people currently in the system.
 *
 * @param {function} callback - a callback which takes two parameters:
 *        (err, people)
 */
backend.getPeople = function (callback) {
    db.all('SELECT * FROM ' + config.TABLE, callback);
}

backend.close = function () {
    console.log('Closing database');
    db.close();
}

/**
 * Called once the database is open
 */
function initDatabase() {
    console.log('Database open');
    
    var statement = 'CREATE TABLE IF NOT EXISTS ' + config.TABLE + ' (\
id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, lat FLOAT, lng FLOAT, \
name VARCHAR(100) NOT NULL, workplace VARCHAR(100) NOT NULL, \
tags VARCHAR(255) NOT NULL)';
    db.run(statement);
}
