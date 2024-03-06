const utils = require('../utils/utils.js');
const po_twitter_userPage = require('../po/po_twitter_userPage.js');
const po_twitter_login = require('../po/po_twitter_login.js');
const po_twitter_chat = require('../po/po_twitter_chat.js');
const EC = protractor.ExpectedConditions;
const fs = require('fs');
const _ = require('lodash');

describe('Twitter - Greet Not Greeted', () => {

    /***
     TODO: run cron to update statuses every day, and greet not greeted clients
     ***/

    let totalMessagesSent = 0;

    it('Twitter - Greet Not Greeted', async () => {

        await browser.driver.manage().window().maximize();
        await po_twitter_login.loginTwitter();

        // get array of all twitter subscriptions for this virtual id in database
        let databaseData = await fs.readFileSync(browser.params.db, 'utf8');
        let databaseObject = await JSON.parse(databaseData);
        let allObjectsWithVirtualId = _.filter(databaseObject, { virtualId: process.env.VIRTUALID });
        let allTwitterUsersOfVirtualId = _.filter(allObjectsWithVirtualId, function(person){
            return /twitter/.test(person.twitterUrl);
        });

        // for every link with twitter user, check subscription status
        for (let i = 0; i < allTwitterUsersOfVirtualId.length; i++) {
            if (allTwitterUsersOfVirtualId[i].twitterStatus === 'Subscribed, not greeted' || allTwitterUsersOfVirtualId[i].twitterStatus === 'Request sent'){
                await browser.get(allTwitterUsersOfVirtualId[i].twitterUrl);
                await po_twitter_userPage.loginButtonWhenLoggedOut.isPresent().then(async (result) => {
                    if (result) { // true
                        await browser.sleep(3000);
                        await po_twitter_userPage.loginButtonWhenLoggedOut.click();
                        await browser.sleep(3000);
                        await browser.get(allTwitterUsersOfVirtualId[i].twitterUrl);
                    }
                });

                await browser.sleep(3000);
                await po_twitter_userPage.sendMessageButton.isPresent().then(async(result) => {
                    if (result) { // true
                        await po_twitter_userPage.sendMessageButton.click();
                        await browser.sleep(3000);
                        await po_twitter_chat.messageInput.sendKeys(browser.params.greetings + '\n');
                        totalMessagesSent = await totalMessagesSent + 1;
                        //await browser.sleep(3000);
                        await browser.wait(EC.visibilityOf(element(by.cssContainingText('span', browser.params.greetings))), 10000).then(() => {
                            allTwitterUsersOfVirtualId[i].twitterStatus = 'Subscribed, greeted';
                        });
                        await fs.writeFileSync(browser.params.db, JSON.stringify(databaseObject));
                        await utils.likeAndPostCommentTwitter(allTwitterUsersOfVirtualId[i].twitterUrl);
                    }

                })

            }

        }

        await utils.updateTotalMessagesSentTwitter(totalMessagesSent);
        await utils.updateTotalStatuses('Twitter');

    });

});