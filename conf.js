const fs = require('fs');
const _ = require('lodash');

// conf.js
exports.config = {
  framework: 'jasmine',
  seleniumAddress: 'http://localhost:4444/wd/hub',
  capabilities: {
      browserName : "chrome",
      chromeOptions: {
          //args: [ "--headless", "--disable-gpu", "--window-size=1920,1080"]
          /*mobileEmulation : {
              deviceMetrics: { "width": 380, "height": 640, "pixelRatio": 3.0 },
              userAgent: "Mozilla/5.0 (Linux; Android 4.2.1; en-us; Nexus 5 Build/JOP40D) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19"
          }*/
      }
  },

  specs: [
    'scripts/instagramSubscribeFromExcel.js',
    'scripts/instagramSendMessages.js',
    'scripts/instagramGreetNotGreeted.js',

    'scripts/twitterSubscribeFromExcel.js',
    'scripts/twitterSendMessages.js',
    'scripts/twitterGreetNotGreeted.js',

    //'scripts/mobile.js',
  ],

  onPrepare: function() {
    browser.ignoreSynchronization = true;
    browser.driver.manage().window().maximize(); // .setSize(1920, 1080)

    let data = fs.readFileSync('./virtuals.json', 'utf8');
    let databaseObject = JSON.parse(data);
    let vbObject = _.find(databaseObject, { virtualId: process.env.VIRTUALID });
    browser.params.db = 'owners/futureMedicine/db/db_futureMedicine.json';
    browser.params.statistics = 'owners/futureMedicine/db/statistics.json';
    browser.params.name = vbObject.name;
    browser.params.instagramEmail = vbObject.instagramEmail;
    browser.params.instagramPassword = vbObject.instagramPassword;
    browser.params.instagramUrl = vbObject.instagramUrl;
    browser.params.instagramUsername = vbObject.instagramUsername;
    browser.params.twitterEmail = vbObject.twitterEmail;
    browser.params.twitterPassword = vbObject.twitterPassword;
    browser.params.twitterUrl = vbObject.twitterUrl;
    browser.params.twitterUsername = vbObject.twitterUsername;
    browser.params.greetings = fs.readFileSync('owners/futureMedicine/messages/greetings.txt', 'utf8');
    browser.params.randomMessage = fs.readFileSync('owners/futureMedicine/messages/message.txt', 'utf8');
  },

  params: {
      excel: undefined, // select excel_with_clients file with new users
      users: undefined, // users passed to command line as parameter
      db: "default", // select database to update
      statistics: "default", // select file woth statistics
      name: "default", // select file woth statistics
      instagramEmail: 'default', // specify VB username
      instagramPassword: 'default', // specify VB username
      twitterEmail: 'default', // specify VB username
      twitterPassword: 'default', // specify VB username
      instagramUrl: 'default',
      twitterUrl: 'default',
      twitterUsername: 'default',
      instagramUsername: 'default',
      greetings: '',
      randomMessage: '',
  }
};