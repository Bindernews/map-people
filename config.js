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
 * Which backend to use. Backends can be found in the 'backends' directory.
 * The backend should be the name of a .js file in the backends directory
 * but without the .js extension. For example to use the sqlite3 backend
 * you would put 'sqlite3'.
 */
config.BACKEND = 'sqlite3';

/**
 * Filename to use with sqlite database
 */
config.DATABASE = 'db.sqlite3';

/**
 * Table in database to store information
 */
config.TABLE = 'people';
