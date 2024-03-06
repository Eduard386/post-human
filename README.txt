1. Install NodeJs and npm (node package manager, it may be installed automatically)
2. UnZip file
3. Go to directory with package.json
4. Run npm install (to install all project dependencies)
5. Run npm run startServer (to download and update chromeDriver, and to start Selenium server)
6. Run script to add users from excel file to database
VIRTUALID=001 ./node_modules/protractor/bin/protractor conf.js --specs=scripts/instagramSubscribeFromExcel.js --params.excel 'owners/futureMedicine/excel_with_clients/01.11.20.xlsx'
8. Run script to send greestings messages from ./owners/futureMedicine/messages/greetings.txt
VIRTUALID=001 ./node_modules/protractor/bin/protractor conf.js --specs=scripts/instagramGreetNotGreeted.js
8. Run script to send common messages from ./owners/futureMedicine/messages/message.txt
VIRTUALID=001 ./node_modules/protractor/bin/protractor conf.js --specs=scripts/instagramSendMessages.js

Where VIRTUALID is a environment variable, which is described in conf.js file, and taken from virtuals.json file, unique for each virtual being