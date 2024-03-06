const utils = require('../utils/utils.js');
const po_twitter_userPage = require('../po/po_twitter_userPage.js');
const po_twitter_login = require('../po/po_twitter_login.js');
const po_instagram_profile = require('../po/po_instagram_profile.js');
const po_instagram_chat = require('../po/po_instagram_chat.js');
const EC = protractor.ExpectedConditions;
const fs = require('fs');
const _ = require('lodash');
const readXlsxFile = require('read-excel-file/node');

const map = {
    'TwitterUrl': 'twitterUrl',
    'Name': 'name',
};

describe('Twitter login', () => {

    it('Twitter login', async () => {

        await browser.driver.manage().window().maximize();
        await po_twitter_login.loginTwitter();

        if (browser.params.excel) {
            await readXlsxFile(browser.params.excel, {map}).then(async ({rows}) => {

                let databaseData = await fs.readFileSync(browser.params.db, 'utf8');
                let databaseObject = await JSON.parse(databaseData);
                let twitterArray = [];

                for (let i = 0; i < rows.length; i++) {

                    let picked = await _.filter(databaseObject, {
                        twitterUrl: rows[i].twitterUrl,
                        virtualId: process.env.VIRTUALID
                    });
                    if (picked.length === 0) { // if client is not in database, add him status

                        await browser.get(rows[i].twitterUrl);
                        await browser.sleep(2000);

                        await po_twitter_userPage.loginButtonWhenLoggedOut.isPresent().then(async (result) => {
                            if (result) { // true
                                await browser.wait(EC.visibilityOf(po_twitter_userPage.loginButtonWhenLoggedOut));
                                await po_twitter_userPage.loginButtonWhenLoggedOut.click();
                                await browser.sleep(3000);
                                await browser.get(rows[i].twitterUrl);
                                await browser.sleep(3000);
                            }
                        });

                        await po_twitter_userPage.accountDoestExistMessage.isPresent().then(async (result) => {
                            if (result) { // true
                                await browser.sleep(1000);
                                rows[i].twitterStatus = 'Page is not available';
                                await browser.sleep(1000);
                            } else { // false
                                await po_twitter_userPage.followButton.isPresent().then(async (result) => {
                                    if (result) { // true
                                        await po_twitter_userPage.followButton.click();
                                        await $('a[href="/login"][role="button"] div[dir="auto"] span span').isPresent().then(async (result) => {
                                            if (result) { // true
                                                await browser.sleep(120000);
                                                await $('a[href="/login"][role="button"] div[dir="auto"] span span').click();
                                                await browser.sleep(3000);
                                                await browser.get(rows[i].twitterUrl);
                                                await browser.sleep(3000);
                                            }
                                        });
                                        // Enter button is present? Click on it and wait for 3 seconds, then open link again
                                        await po_twitter_userPage.sendMessageButton.isPresent().then(result => {
                                            if (result) { // true
                                                rows[i].twitterStatus = 'Subscribed, not greeted'
                                            } else { // false
                                                rows[i].twitterStatus = 'Request sent'
                                            }
                                        });
                                    }
                                });
                            }

                        });

                        rows[i].virtualId = process.env.VIRTUALID;
                        await twitterArray.push(rows[i])

                    }
                }

                databaseObject = databaseObject.concat(twitterArray);
                await fs.writeFileSync(browser.params.db, JSON.stringify(databaseObject));
                await utils.updateTotalStatuses('Twitter');

            });
        } else if (browser.params.users) {

            let usersArray = browser.params.users.split(',');
            let databaseData = await fs.readFileSync(browser.params.db, 'utf8');
            let databaseObject = await JSON.parse(databaseData);
            let twitterArray = [];

            for (let i = 0; i < usersArray.length; i++) {

                let picked = await _.filter(databaseObject, {
                    twitterUrl: "https://twitter.com/" + usersArray[i],
                    virtualId: process.env.VIRTUALID
                });
                if (picked.length === 0) { // if client is not in database, add him status

                    let newUser = {
                        twitterUrl: "https://twitter.com/" + usersArray[i],
                        virtualId: process.env.VIRTUALID
                    };

                    await browser.get(newUser.twitterUrl);
                    await browser.sleep(2000);

                    await po_twitter_userPage.loginButtonWhenLoggedOut.isPresent().then(async (result) => {
                        if (result) { // true
                            await browser.wait(EC.visibilityOf(po_twitter_userPage.loginButtonWhenLoggedOut));
                            await po_twitter_userPage.loginButtonWhenLoggedOut.click();
                            await browser.sleep(3000);
                            await browser.get(newUser.twitterUrl);
                            await browser.sleep(3000);
                        }
                    });

                    await po_twitter_userPage.accountDoestExistMessage.isPresent().then(async (result) => {
                        if (result) { // true
                            await browser.sleep(1000);
                            newUser.twitterStatus = 'Page is not available';
                            await browser.sleep(1000);
                        } else { // false
                            await po_twitter_userPage.followButton.isPresent().then(async (result) => {
                                if (result) { // true
                                    await po_twitter_userPage.followButton.click();
                                    await $('a[href="/login"][role="button"] div[dir="auto"] span span').isPresent().then(async (result) => {
                                        if (result) { // true
                                            await browser.sleep(120000);
                                            await $('a[href="/login"][role="button"] div[dir="auto"] span span').click();
                                            await browser.sleep(3000);
                                            await browser.get(newUser.twitterUrl);
                                            await browser.sleep(3000);
                                        }
                                    });
                                    // Enter button is present? Click on it and wait for 3 seconds, then open link again
                                    await po_twitter_userPage.sendMessageButton.isPresent().then(result => {
                                        if (result) { // true
                                            newUser.twitterStatus = 'Subscribed, not greeted'
                                        } else { // false
                                            newUser.twitterStatus = 'Request sent'
                                        }
                                    });
                                }
                            });
                        }
                    });
                    await twitterArray.push(newUser)
                }
            }

            databaseObject = databaseObject.concat(twitterArray);
            await fs.writeFileSync(browser.params.db, JSON.stringify(databaseObject));
            await utils.updateTotalStatuses('Twitter');
        }

    });

});