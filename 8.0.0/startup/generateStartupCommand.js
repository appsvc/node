#!/usr/bin/env node
const fs = require('fs'),
      util = require('util');

console.log("Generating app startup command");

const DEFAULTAPP = "/opt/startup/default-static-site.js";
const OUTFILE = "/opt/startup/startupCommand";

var httpLoggingEnabled = process.env.HTTP_LOGGING_ENABLED;
httpLoggingEnabled = (typeof httpLoggingEnabled !== 'undefined'
    && httpLoggingEnabled !== null
    && (httpLoggingEnabled.toLowerCase() === 'true' || httpLoggingEnabled.toLowerCase() === '1'))

console.log("HTTP logging enabled: " + httpLoggingEnabled)

var roleInstanceId = '';
if (typeof process.env.WEBSITE_ROLE_INSTANCE_ID !== 'undefined'
    && process.env.WEBSITE_ROLE_INSTANCE_ID !== null) {
    roleInstanceId = process.env.WEBSITE_ROLE_INSTANCE_ID;
}

var startupCommand;
var appCommandLine = process.argv.slice(2);

if (appCommandLine.length >= 2) {
    startupCommand = appCommandLine.join(" ");
    console.log("Fully specified startup command detected.");
}
else {
    var outFile = '/dev/null';
    var errFile = '/dev/null';

    if (httpLoggingEnabled) {
        outFile = util.format('/home/LogFiles/node_%s_out.log', roleInstanceId);
        errFile = util.format('/home/LogFiles/node_%s_err.log', roleInstanceId);
    }

    var pm2Template = util.format("pm2 start %%s --no-daemon --merge-logs -o %s -e %s", outFile, errFile);

    if (appCommandLine.length == 1) {
        // Assume a single-token appCommandLine is a startable node app, and
        // run it with pm2
        console.log("Single-token startup command detected, running as JavaScript via PM2");
        startupCommand = util.format(pm2Template, appCommandLine[0]);
    }
    else {
        // No appCommandLine, try to autodetect a user app
        var autos = ['bin/www', 'server.js', 'app.js', 'index.js', 'hostingstart.js'];
        for (var i = 0; i < autos.length; i++) {
            var filename = "/home/site/wwwroot/" + autos[i];
            if (fs.existsSync(filename)) {
                console.log("Empty startup command detected, but found " +
                    filename + ". Running as JavaScript via PM2.");
                startupCommand = util.format(pm2Template, filename);
                break;
            }
        }

        if (!startupCommand)
        {
            var packageJsonPath = "/home/site/wwwroot/package.json";
            var json = fs.existsSync(packageJsonPath) && JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
            if (typeof json == 'object' 
                && typeof json.scripts == 'object'
                && typeof json.scripts.start == 'string')
            {
                console.log("Found scripts.start in package.json, running 'npm start'.")
                startupCommand = 'npm start';
            }
        }

        if (!startupCommand) {
            console.log("Empty startup command detected and no candidate startup script " +
                "found. Running default static site.");
            startupCommand = util.format(pm2Template, DEFAULTAPP);
        }
    }
}

// Write to file
fs.writeFileSync(OUTFILE, startupCommand);