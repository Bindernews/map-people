/*
    Map-People

    Copyright (c) 2015, Drew Heintz. All rights reserved.
    Use of this source code is governed by the MIT License, which can be found
    in the LICENSE.txt file.
 */

// The file specifies configuration settings for the server. Be extremely
// careful when changing things. 

var config = module.exports = {};


/**
 * Default server port.
 */
config.PORT = process.env.PORT || 3000;

/**
 * Filename to use with sqlite database
 */
config.DATABASE = process.env.DATABASE || 'db.sqlite3';

/**
 * Table in database to store information
 */
config.TABLE = process.env.TABLE || 'people';
