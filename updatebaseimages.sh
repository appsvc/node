#!/bin/bash
set -e
NEW_TAG=$1
if [ -z $NEW_TAG ]; then
    echo "Target Oryx tag was not provided, getting the latest from GitHub..."
    NEW_TAG=$(curl -L https://api.github.com/repos/Microsoft/Oryx/releases/latest 2> /dev/null | jq '.tag_name' | sed 's!\"!!g')
fi

echo "New tag: $NEW_TAG"
REPLACE_CMD="s!(mcr.microsoft.com/oryx/node-.*):(.*)!\1:$NEW_TAG!g"
find . -name Dockerfile -print0 | xargs -0 sed -ri $REPLACE_CMD
