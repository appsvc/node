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

// Is Application Insights enabled, with an associated ikey?
var appInsightsEnabled = process.env.ENABLE_APPINSIGHTS && process.env.APPINSIGHTS_INSTRUMENTATIONKEY;
var appInsightsPreloadArg = "--require /opt/startup/initAppInsights.js";
var nodeCommandPrefix = "node ";

if (appInsightsEnabled) {
console.log("Application Insights enabled");
nodeCommandPrefix += appInsightsPreloadArg + " ";
}

function augmentCommandIfNeccessary(command) {
if (!command || !appInsightsEnabled) {
  return command;
}

// Application Insights is enabled, so we need to
// to update the specified startup command to pre-load it.
if (command.indexOf("pm2 start ") === 0) {
  return command += " --node-args='" + appInsightsPreloadArg + "'";
} else if (command.indexOf("node ") === 0) {
  // Simply replacing the prefix allows the user to specify
  // additional Node flags, in addition to the AI preload one.
  return command.replace("node ", nodeCommandPrefix);
}

// The command is using an unknown executable, and therefore,
// the App Insights runtime can't be automatically enabled.
return command;
}

var startupCommand = augmentCommandIfNeccessary(fs.readFileSync(CMDFILE, 'utf8').trim());

// No user-provided startup command, check for scripts.start
if (!startupCommand) {
var packageJsonPath = "/home/site/wwwroot/package.json";
var json = fs.existsSync(packageJsonPath) && JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
if (typeof json == 'object' && typeof json.scripts == 'object' && typeof json.scripts.start == 'string') {
  console.log("Found scripts.start in package.json");
  startupCommand = augmentCommandIfNeccessary(json.scripts.start.trim());
}
}

// No scripts.start; can we autodetect an app?
if (!startupCommand) {
var autos = ['bin/www', 'server.js', 'app.js', 'index.js', 'hostingstart.js'];
for (var i = 0; i < autos.length; i++) {
  var filename = "/home/site/wwwroot/" + autos[i];
  if (fs.existsSync(filename)) {
      console.log("No startup command entered, but found " + filename);
      startupCommand = nodeCommandPrefix + filename;
      break;
  }
}
}

// Still nothing, run the default static site
if (!startupCommand) {
console.log("No startup command or autodetected startup script " +
  "found. Running default static site.");
startupCommand = nodeCommandPrefix + DEFAULTAPP;
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