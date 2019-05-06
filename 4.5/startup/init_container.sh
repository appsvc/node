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

sed -i "s/SSH_PORT/$SSH_PORT/g" /etc/ssh/sshd_config
service ssh start

mkdir "$PM2HOME"
chmod 777 "$PM2HOME"
ln -s /home/LogFiles "$PM2HOME"/logs

# Get environment variables to show up in SSH session
eval $(printenv | sed -n "s/^\([^=]\+\)=\(.*\)$/export \1=\2/p" | sed 's/"/\\\"/g' | sed '/=/s//="/' | sed 's/$/"/' >> /etc/profile)

#
# Extract dependencies if required:
#
if [ -f "oryx-manifest.toml" ] && [ ! "$APPSVC_RUN_ZIP" = "TRUE" ] ; then
    echo "Found 'oryx-manifest.toml', checking if node_modules was compressed..."
    source "oryx-manifest.toml"
    if [ ${compressedNodeModulesFile: -4} == ".zip" ]; then
        echo "Found zip-based node_modules."
        extractionCommand="unzip -q $compressedNodeModulesFile -d /node_modules"
    elif [ ${compressedNodeModulesFile: -7} == ".tar.gz" ]; then
        echo "Found tar.gz based node_modules."
        extractionCommand="tar -xzf $compressedNodeModulesFile -C /node_modules"
    fi
    if [ ! -z "$extractionCommand" ]; then
        echo "Removing existing modules directory..."
        rm -fr /node_modules
        mkdir -p /node_modules
        echo "Extracting modules..."
        $extractionCommand
    fi
    echo "Done."
fi

echo "$@" > /opt/startup/startupCommand
node /opt/startup/generateStartupCommand.js

STARTUPCOMMAND=$(cat /opt/startup/startupCommand)
echo "Running $STARTUPCOMMAND"
eval "exec $STARTUPCOMMAND"