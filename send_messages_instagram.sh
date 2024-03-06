#!/bin/bash

cd ~/Documents/Protractor/VB/

# start server on the background
./node_modules/.bin/webdriver-manager start --detach

VIRTUALID=001 ./node_modules/protractor/bin/protractor conf.js --specs=scripts/instagramSendMessages.js

# kill server process
lsof -t -i tcp:4444 | xargs kill
