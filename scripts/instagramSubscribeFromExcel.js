const utils = require('../utils/utils.js');
const po_instagram_userPage = require('../po/po_instagram_userPage.js');
const readXlsxFile = require('read-excel-file/node');
const fs = require('fs');
const _ = require('lodash');
const EC = protractor.ExpectedConditions;

const map = {
    'InstagramUrl': 'instagramUrl',
    'Name': 'name',
};

describe('Subsribe bulk users from excel_with_clients file', () => {

    it('Add to friends everyone from rows', async () => {

        await browser.driver.manage().window().setSize(1920, 1080);
        await utils.loginInstagram();
        await browser.wait(EC.visibilityOf($('input[placeholder="Поиск"]')), 10000);

        if (browser.params.excel) {
            await readXlsxFile(browser.params.excel, {map}).then(async ({rows}) => {

                let databaseData = await fs.readFileSync(browser.params.db, 'utf8');
                let databaseObject = await JSON.parse(databaseData);

                let instagramArray = [];

                for (let i = 0; i < rows.length; i++) {

                    let picked = await _.filter(databaseObject, {
                        instagramUrl: rows[i].instagramUrl,
                        virtualId: process.env.VIRTUALID
                    });
                    if (picked.length === 0) { // if client is not in database, add him status

                        await browser.get(rows[i].instagramUrl);
                        await browser.sleep(3000);

                        await po_instagram_userPage.pageNotAvailable.isPresent().then(result => {
                            if (result) { // true
                                rows[i].instagramStatus = 'Page is not available'
                            }
                        });

                        await po_instagram_userPage.subscribeButton.isPresent().then(async (result) => {
                            if (result) { // true
                                await po_instagram_userPage.subscribeButton.click();
                                await browser.sleep(3000);

                                await po_instagram_userPage.requestSentButton.isPresent().then(result => {
                                    if (result) { // true
                                        rows[i].instagramStatus = 'Request sent'
                                    }
                                });

                                await po_instagram_userPage.sendMessageButton.isPresent().then(result => {
                                    if (result) { // true
                                        rows[i].instagramStatus = 'Subscribed, not greeted'
                                    }
                                });
                            }
                        });

                        rows[i].virtualId = process.env.VIRTUALID;
                        await instagramArray.push(rows[i])
                    }
                }

                databaseObject = databaseObject.concat(instagramArray);
                await fs.writeFileSync(browser.params.db, JSON.stringify(databaseObject));
                await utils.updateTotalStatuses('Instagram');

            });
        } else if (browser.params.users) {

            let usersArray = browser.params.users.split(',');
            let databaseData = await fs.readFileSync(browser.params.db, 'utf8');
            let databaseObject = await JSON.parse(databaseData);
            let instagramArray = [];

            for (let i = 0; i < usersArray.length; i++) {

                let picked = await _.filter(databaseObject, {
                    instagramUrl: "https://www.instagram.com/" + usersArray[i] + "/",
                    virtualId: process.env.VIRTUALID
                });
                if (picked.length === 0) { // if client is not in database, add him status

                    let newUser = {
                        instagramUrl: "https://www.instagram.com/" + usersArray[i] + "/",
                        virtualId: process.env.VIRTUALID
                    };

                    await browser.get(newUser.instagramUrl);
                    await browser.sleep(3000);

                    await po_instagram_userPage.pageNotAvailable.isPresent().then(result => {
                        if (result) { // true
                            newUser.instagramStatus = 'Page is not available'
                        }
                    });

                    await po_instagram_userPage.subscribeButton.isPresent().then(async (result) => {
                        if (result) { // true
                            await po_instagram_userPage.subscribeButton.click();
                            await browser.sleep(3000);

                            await po_instagram_userPage.requestSentButton.isPresent().then(result => {
                                if (result) { // true
                                    newUser.instagramStatus = 'Request sent'
                                }
                            });

                            await po_instagram_userPage.sendMessageButton.isPresent().then(result => {
                                if (result) { // true
                                    newUser.instagramStatus = 'Subscribed, not greeted'
                                }
                            });
                        }
                    });

                    await instagramArray.push(newUser)
                }
            }

            databaseObject = databaseObject.concat(instagramArray);
            await fs.writeFileSync(browser.params.db, JSON.stringify(databaseObject));
            await utils.updateTotalStatuses('Instagram');
        }

    });

});