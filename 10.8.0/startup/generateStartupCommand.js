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

var finalCommand = startupCommand;

// No scripts.start; can we autodetect an app?
if (!startupCommand) {
    var autos = ['bin/www', 'server.js', 'app.js', 'index.js', 'hostingstart.js'];
    for (var i = 0; i < autos.length; i++) {
        var filename = "/home/site/wwwroot/" + autos[i];
        if (fs.existsSync(filename)) {
            console.log("No startup command entered, but found " + filename);
            finalCommand = filename;
            break;
        }
    }
}

// Still nothing, run the default static site
if (!startupCommand && !finalCommand) {
    console.log("No startup command or autodetected startup script " +
        "found. Running default static site.");
    finalCommand = DEFAULTAPP;
}

if (finalCommand && fs.existsSync(finalCommand)) {
    if (process.env.APPSVC_REMOTE_DEBUGGING == "TRUE")
    {
        if (process.env.APPSVC_REMOTE_DEBUGGING_BREAK == "TRUE")
        {
            startupCommand = "node --inspect-brk=0.0.0.0:" + process.env.APPSVC_TUNNEL_PORT + " " + finalCommand;
        }
        else
        {
            startupCommand = "node --inspect=0.0.0.0:" + process.env.APPSVC_TUNNEL_PORT + " " + finalCommand;
        }
    }
    else
    {
        // Run with pm2
        startupCommand = "pm2 start " + finalCommand + " --no-daemon";
    }
}


// Write to file
fs.writeFileSync(CMDFILE, startupCommand);
