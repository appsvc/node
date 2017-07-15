#!/usr/bin/env node
const fs = require('fs'),
      util = require('util');

console.log("Generating app startup command");

const DEFAULTAPP = "/opt/startup/default-static-site.js";
const CMDFILE = "/opt/startup/startupCommand";

var httpLoggingEnabled = process.env.HTTP_LOGGING_ENABLED;
httpLoggingEnabled = (typeof httpLoggingEnabled !== 'undefined'
    && httpLoggingEnabled !== null
    && (httpLoggingEnabled.toLowerCase() === 'true' || httpLoggingEnabled.toLowerCase() === '1'))

var roleInstanceId = '';
if (typeof process.env.WEBSITE_ROLE_INSTANCE_ID !== 'undefined'
    && process.env.WEBSITE_ROLE_INSTANCE_ID !== null) {
    roleInstanceId = process.env.WEBSITE_ROLE_INSTANCE_ID;
}

var startupCommand = fs.readFileSync(CMDFILE, 'utf8').trim();

// No user-provided startup command, check for scripts.start
if (!startupCommand) {
    var packageJsonPath = "/home/site/wwwroot/package.json";
    var json = fs.existsSync(packageJsonPath) && JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    if (typeof json == 'object' && typeof json.scripts == 'object' && typeof json.scripts.start == 'string') {
        console.log("Found scripts.start in package.json")
        startupCommand = 'npm start';
    }
}

// No scripts.start; can we autodetect an app?
if (!startupCommand) {
    var autos = ['bin/www', 'server.js', 'app.js', 'index.js', 'hostingstart.js'];
    for (var i = 0; i < autos.length; i++) {
        var filename = "/home/site/wwwroot/" + autos[i];
        if (fs.existsSync(filename)) {
            console.log("No startup command entered, but found " + filename);
            startupCommand = "node " + filename;
            break;
        }
    }
}

// Still nothing, run the default static site
if (!startupCommand) {
    console.log("No startup command or autodetected startup script " +
        "found. Running default static site.");
    startupCommand = "node " + DEFAULTAPP;
}

// If HTTP logging is enabled and it doesn't appear that the user has tried to do any
// redirection in their startup command, redirect stdout and stderr to files.
if (httpLoggingEnabled) {
    if (startupCommand.indexOf(">") === -1) {
        console.log("HTTP logging enabled and no output redirection present in startup "
         + "command. Redirecting stdout and stderr to files.")
        var outFile = util.format('/home/LogFiles/node_%s_out.log', roleInstanceId);
        var errFile = util.format('/home/LogFiles/node_%s_err.log', roleInstanceId);
        startupCommand += util.format(" >> %s 2>> %s", outFile, errFile);
    }
}

// Write to file
fs.writeFileSync(CMDFILE, startupCommand);