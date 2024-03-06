const utils = require('../utils/utils.js');
const po_instagram_userPage = require('../po/po_instagram_userPage.js');
const po_instagram_profile = require('../po/po_instagram_profile.js');
const po_instagram_chat = require('../po/po_instagram_chat.js');
const EC = protractor.ExpectedConditions;
const fs = require('fs');
const _ = require('lodash');

describe('Instagram - Greet Not Greeted', () => {

    /***
     TODO: run cron to update statuses every day, and greet not greeted clients
     ***/

    let totalMessagesSent = 0;

    it('Instagram - Greet Not Greeted', async () => {

        await browser.driver.manage().window().maximize();
        await utils.loginInstagram();
        await utils.openProfilePage();
        await po_instagram_profile.openSubscriptionsModal();

        let arrayOfSubscriptionsLinks = await po_instagram_profile.getArrayOfSubscriptionsLinks();

        await utils.updateStatusesOfCurrentSubscribtions(arrayOfSubscriptionsLinks);

        for (let i = 0; i < arrayOfSubscriptionsLinks.length; i++) {

            let data = await fs.readFileSync(browser.params.db, 'utf8');
            let users = JSON.parse(data);
            let user = _.find(users, { instagramUrl: arrayOfSubscriptionsLinks[i], virtualId: process.env.VIRTUALID });
            if (user && user.instagramStatus === 'Subscribed, not greeted') {
                await browser.get(arrayOfSubscriptionsLinks[i]);
                await browser.wait(EC.visibilityOf(po_instagram_userPage.sendMessageButton), 10000);
                await po_instagram_userPage.sendMessageButton.click();
                await browser.sleep(5000);
                await utils.clickNotNow();

                await browser.wait(EC.visibilityOf(po_instagram_chat.messageInput), 10000);
                await po_instagram_chat.messageInput.sendKeys(browser.params.greetings + '\n');
                totalMessagesSent = await totalMessagesSent + 1;
                await browser.wait(EC.visibilityOf(element.all(by.cssContainingText('span', browser.params.greetings)).first()), 10000).then(() => {
                    user.instagramStatus = 'Subscribed, greeted';
                });
                await fs.writeFileSync(browser.params.db, JSON.stringify(users));

                await utils.likeAndPostCommentInstagram(arrayOfSubscriptionsLinks[i]);
            }

        }

        await utils.updateTotalMessagesSentInstagram(totalMessagesSent);
        await utils.updateTotalStatuses('Instagram');

    });

});