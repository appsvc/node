#!/usr/bin/env bash
cat >/etc/motd <<EOL 
  _____                               
  /  _  \ __________ _________   ____  
 /  /_\  \\___   /  |  \_  __ \_/ __ \ 
/    |    \/    /|  |  /|  | \/\  ___/ 
\____|__  /_____ \____/ |__|    \___  >
        \/      \/                  \/ 
A P P   S E R V I C E   O N   L I N U X

Documentation: http://aka.ms/webapp-linux
NodeJS quickstart: https://aka.ms/node-qs

EOL
cat /etc/motd

mkdir "$PM2HOME"
chmod 777 "$PM2HOME"
ln -s /home/LogFiles "$PM2HOME"/logs

# Get environment variables to show up in SSH session
eval $(printenv | sed -e 's/^\([^=]*\)=\(.*\)$/export \1="\2"/g' >> /etc/profile)

# feature flag for remote debugging for with npm
# set flag and restart site to remove these changes
if [ "$APPSVC_REMOTE_DEBUGGING" = "TRUE" ] && [ ! "$APPSETTING_REMOTE_DEBUGGING_FEATURE_FLAG" = "FALSE" ]
then
        mv /usr/local/bin/node /usr/local/bin/node-original
        mv /opt/startup/node-wrapper.sh /usr/local/bin/node
        chmod a+x /usr/local/bin/node
        sed -i 's/env node/env node-original/' /usr/local/lib/node_modules/npm/bin/npm-cli.js
        sed -i 's/env node/env node-original/' /usr/local/lib/node_modules/npm/bin/npx-cli.js
        sed -i 's/env node/env node-original/' /usr/local/lib/node_modules/pm2/bin/pm2
        sed -i 's/env node/env node-original/' /usr/local/lib/node_modules/pm2/bin/pm2-dev
        sed -i 's/env node/env node-original/' /usr/local/lib/node_modules/pm2/bin/pm2-docker
        sed -i 's/env node/env node-original/' /usr/local/lib/node_modules/pm2/bin/pm2-runtime
        sed -i 's/env node/env node-original/' /opt/startup/generateStartupCommand.js
fi

echo "$@" > /opt/startup/startupCommand
node /opt/startup/generateStartupCommand.js
chmod 755 /opt/startup/startupCommand
STARTUPCOMMAND=$(cat /opt/startup/startupCommand)
echo "Running $STARTUPCOMMAND"
eval "exec $STARTUPCOMMAND" &

# Ensure this happens after /sbin/init
( sleep 5 ; /etc/init.d/sshd restart ) &

# Needs to start as PID 1 for openrc on alpine
exec -c /sbin/init 
