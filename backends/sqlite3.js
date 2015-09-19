/*
    Map-People

    Copyright (c) 2015, Drew Heintz. All rights reserved.
    Use of this source code is governed by the MIT License, which can be found
    in the LICENSE.txt file.
 */


// The SQLite backend for data storage
var sqlite3 = require('sqlite3'),
    config = require('../config');

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
