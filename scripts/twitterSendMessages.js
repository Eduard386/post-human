const utils = require('../utils/utils.js');
const po_twitter_userPage = require('../po/po_twitter_userPage.js');
const po_twitter_login = require('../po/po_twitter_login.js');
const po_twitter_chat = require('../po/po_twitter_chat.js');
const EC = protractor.ExpectedConditions;
const fs = require('fs');
const _ = require('lodash');

describe('Send messages for Twitter', () => {

    let totalMessagesSent = 0;

    it('Send messages for Twitter', async () => {

        await browser.driver.manage().window().maximize();
        await po_twitter_login.loginTwitter();

        // get array of all twitter subscriptions for this virtual id in database
        let databaseData = await fs.readFileSync(browser.params.db, 'utf8');
        let databaseObject = await JSON.parse(databaseData);
        let allObjectsWithVirtualId = _.filter(databaseObject, { virtualId: process.env.VIRTUALID });
        let allTwitterUsersOfVirtualId = _.filter(allObjectsWithVirtualId, function(person){
            return /twitter/.test(person.twitterUrl);
        });

        for (let i = 0; i < allTwitterUsersOfVirtualId.length; i++) {

            if (allTwitterUsersOfVirtualId[i].twitterStatus === 'Subscribed, greeted'){
                await browser.get(allTwitterUsersOfVirtualId[i].twitterUrl);
                await browser.sleep(3000);
                await po_twitter_userPage.loginButtonWhenLoggedOut.isPresent().then(async (result) => {
                    if (result) { // true
                        //await browser.sleep(3000);
                        await browser.wait(EC.visibilityOf(po_twitter_userPage.loginButtonWhenLoggedOut));
                        await po_twitter_userPage.loginButtonWhenLoggedOut.click();
                        await browser.sleep(3000);
                        await browser.get(allTwitterUsersOfVirtualId[i].twitterUrl);
                        //await browser.sleep(3000);
                        await browser.wait(EC.visibilityOf(po_twitter_userPage.sendMessageButton));
                    }
                });
                await po_twitter_userPage.sendMessageButton.isPresent().then(async(result) => {
                    if (result) { // true
                        await po_twitter_userPage.sendMessageButton.click();
                        await browser.sleep(3000);

                        //let randomMessage = await fs.readFileSync(browser.params.randomMessage, 'utf8');
                        await po_twitter_chat.messageInput.sendKeys(browser.params.randomMessage + '\n');
                        //await browser.sleep(3000);
                        await browser.wait(EC.visibilityOf(element(by.cssContainingText('span', browser.params.randomMessage))));
                        totalMessagesSent = await totalMessagesSent + 1;
                    }
                })

            }

            // Every time before sending random message, we check new not greeted users, and greet them
            /*
            * TODO: move greetings to separate function, use it in cron too
            */
            if (allTwitterUsersOfVirtualId[i].twitterStatus === 'Subscribed, not greeted' || allTwitterUsersOfVirtualId[i].twitterStatus === 'Request sent'){
                await browser.get(allTwitterUsersOfVirtualId[i].twitterUrl);
                await po_twitter_userPage.loginButtonWhenLoggedOut.isPresent().then(async (result) => {
                    if (result) { // true
                        //await browser.sleep(3000);
                        await browser.wait(EC.visibilityOf(po_twitter_userPage.loginButtonWhenLoggedOut));
                        await po_twitter_userPage.loginButtonWhenLoggedOut.click();
                        await browser.sleep(3000);
                        await browser.get(allTwitterUsersOfVirtualId[i].twitterUrl);
                    }
                });

                await browser.wait(EC.visibilityOf(po_twitter_userPage.sendMessageButton));
                //await browser.sleep(3000);
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

        await fs.writeFileSync(browser.params.db, JSON.stringify(databaseObject));
        await utils.updateTotalMessagesSentTwitter(totalMessagesSent);
        await utils.updateTotalStatuses('Twitter');

    });

});