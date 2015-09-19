/*
    Code copied from the SerGIS Project
    
    Copyright (c) 2015, SerGIS Project Contributors. All rights reserved.
    Use of this source code is governed by the MIT License, which can be found
    in the LICENSE.txt file.
 */



/**
 * Functions to call right before exiting.
 * @type Array.<Function>
 */
var exitHandlers = module.exports = [];

/**
 * Initialize the exit handlers.
 */
function initExitHandlers() {
    // So that the server will not close instantly when Ctrl+C is pressed, etc.
    try {
        process.stdin.resume();
    } catch (err) {
        // This might happen if we're not running from a terminal or something
        //console.error("Error listening on stdin: ", err.stack);
    }

    // Catch app closing
    process.on("beforeExit", runExitHandlers);

    // Catch exit signals (NOTE: Ctrl+C == SIGINT)
    process.on("SIGINT", runExitHandlers.bind(this, "caught SIGINT"));
    process.on("SIGTERM", runExitHandlers.bind(this, "caught SIGTERM"));
    process.on("SIGHUP", runExitHandlers.bind(this, "caught SIGHUP"));

    // Catch uncaught exceptions
    process.on("uncaughtException", function (err) {
        console.log("");
        console.error("UNCAUGHT EXCEPTION: ", err.stack);
        runExitHandlers();
    });
}

/**
 * Run all the exit handlers.
 *
 * @param {string} reason - The reason that we're exiting.
 */
function runExitHandlers(reason) {
    console.log("");
    console.log("Running exit handlers" + (reason ? " (" + reason + ")" : "") + "...");

    // Start from the end and run each exit handler
    while (exitHandlers.length) {
        try {
            exitHandlers.pop()();
        } catch (err) {
            console.error("Error running exit handler: ", err.stack);
        }
    }
    console.log("Exiting server...");
    process.exit();
}

initExitHandlers();
