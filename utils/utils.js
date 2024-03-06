const EC = protractor.ExpectedConditions;
const po_instagram_profile = require('../po/po_instagram_profile');
const po_instagram_userPage = require('../po/po_instagram_userPage');
const po_twitter_userPage = require('../po/po_twitter_userPage');
const po_instagram_chat = require('../po/po_instagram_chat');
const po_instagram_login = require('../po/po_instagram_login');
const po_twitter_login = require('../po/po_twitter_login');
const fs = require('fs');
const _ = require('lodash');
const comments = require('../comments');

let utils = function() {

    this.getCurrentDate = function () {
        let today = new Date();
        let dd = today.getDate();
        let mm = today.getMonth() + 1;
        let yyyy = today.getFullYear();
        if (dd < 10) {
            dd = '0' + dd;
        }
        if (mm < 10) {
            mm = '0' + mm;
        }
        return dd + '/' + mm + '/' + yyyy;
    };

    this.loginInstagram = async() => {
        let totalLogins = 0;
        await browser.get(po_instagram_login.homepageUrl);
        await browser.wait(EC.visibilityOf(po_instagram_login.emailInput), 10000);
        await po_instagram_login.emailInput.sendKeys(browser.params.instagramEmail);
        await po_instagram_login.passwordInput.sendKeys(browser.params.instagramPassword);
        await po_instagram_login.loginButton.click();
        await browser.wait(EC.visibilityOf(po_instagram_chat.notNowButton), 10000);
        totalLogins = await totalLogins + 1;

        let statisticsData = await fs.readFileSync(browser.params.statistics, 'utf8');
        let statisticsObjects = await JSON.parse(statisticsData);
        let statisticsObjectTodayForVirtualId = _.find(statisticsObjects, { date: this.getCurrentDate(), virtualId: process.env.VIRTUALID });

        if (statisticsObjectTodayForVirtualId) {
            if (statisticsObjectTodayForVirtualId.instagram){
                statisticsObjectTodayForVirtualId.instagram.totalLogins = await statisticsObjectTodayForVirtualId.instagram.totalLogins + totalLogins;
            } else {
                statisticsObjectTodayForVirtualId.instagram = { totalLogins: totalLogins }
            }
        } else {
            await statisticsObjects.push({
                date: this.getCurrentDate(),
                virtualId: process.env.VIRTUALID,
                instagram: {
                    totalLogins: totalLogins
                }
            })
        }
        await fs.writeFileSync(browser.params.statistics, JSON.stringify(statisticsObjects));
    };

    this.clickNotNow = async() => {
        await po_instagram_chat.notNowButton.isPresent().then(async(result) => {
            if (result) { // true
                await po_instagram_chat.notNowButton.click();
            }
        });
    };

    this.openProfilePage = async() => {
        await browser.get(browser.params.instagramUrl);
        await browser.wait(EC.visibilityOf(po_instagram_profile.subscriptionsLink), 10000);
    };
// read database, iterate over it, status = Subscribed greeted/not greeted, and absent in arrayOfCurrent subscriptions, change status to Unsubscribed
    this.updateStatusesOfCurrentSubscribtions = async(arrayOfCurrentSubscriptions) => {

        for (let i = 0; i < arrayOfCurrentSubscriptions.length; i++) {
            let data = await fs.readFileSync(browser.params.db, 'utf8');
            let databaseObject = await JSON.parse(data);
            let user = await _.find(databaseObject, { instagramUrl: arrayOfCurrentSubscriptions[i], virtualId: process.env.VIRTUALID });
            // skip subscribers which are not our owners from database, by user.length
            if (user && (user.instagramStatus === "Request sent" || user.instagramStatus === "Page is not available")) {
                user.instagramStatus = 'Subscribed, not greeted';
                await fs.writeFileSync(browser.params.db, JSON.stringify(databaseObject))
            }

            // find all subscribed users in DB, compare them with current subscriptions, if not match - change status to Unsubscribed
            let listOfSubscriptionsInDb = await _.map(databaseObject, function(user) {
                if (user.virtualId === process.env.VIRTUALID && (user.instagramStatus === 'Subscribed, not greeted' || user.instagramStatus === 'Subscribed, greeted')) return user;
            });
            // Remove undefined from the array
            let listOfSubscriptionsInDbWithoutUndefined = await _.without(listOfSubscriptionsInDb, undefined);

            for (let i =0; i < listOfSubscriptionsInDbWithoutUndefined.length; i++) {
                if (!arrayOfCurrentSubscriptions.includes(listOfSubscriptionsInDbWithoutUndefined[i].instagramUrl)){
                    listOfSubscriptionsInDbWithoutUndefined[i].instagramStatus = 'Account deleted, user blocked us or unsubscribed';
                    await fs.writeFileSync(browser.params.db, JSON.stringify(databaseObject))
                }
            }

        }
    };

    this.updateTotalMessagesSentInstagram = async(totalMessagesSent) => {

        let statisticsData = await fs.readFileSync(browser.params.statistics, 'utf8');
        let statisticsObjects = await JSON.parse(statisticsData);
        let statisticsObjectTodayForVirtualId = _.find(statisticsObjects, { date: this.getCurrentDate(), virtualId: process.env.VIRTUALID });
        if (statisticsObjectTodayForVirtualId) {
            if (statisticsObjectTodayForVirtualId.instagram.totalMessagesSent) {
                statisticsObjectTodayForVirtualId.instagram.totalMessagesSent = await statisticsObjectTodayForVirtualId.instagram.totalMessagesSent + totalMessagesSent;
            } else {
                statisticsObjectTodayForVirtualId.instagram.totalMessagesSent = totalMessagesSent
            }
        } else {
            await statisticsObjects.push({ date: this.getCurrentDate(), virtualId: process.env.VIRTUALID, instagram: { totalMessagesSent: totalMessagesSent } })
        }
        await fs.writeFileSync(browser.params.statistics, JSON.stringify(statisticsObjects));
    };

    this.updateTotalMessagesSentTwitter = async(totalMessagesSent) => {

        let statisticsData = await fs.readFileSync(browser.params.statistics, 'utf8');
        let statisticsObjects = await JSON.parse(statisticsData);
        let statisticsObjectTodayForVirtualId = _.find(statisticsObjects, { date: this.getCurrentDate(), virtualId: process.env.VIRTUALID });
        if (statisticsObjectTodayForVirtualId) {
            if (statisticsObjectTodayForVirtualId.twitter.totalMessagesSent) {
                statisticsObjectTodayForVirtualId.twitter.totalMessagesSent = await statisticsObjectTodayForVirtualId.twitter.totalMessagesSent + totalMessagesSent;
            } else {
                statisticsObjectTodayForVirtualId.twitter.totalMessagesSent = totalMessagesSent
            }
        } else {
            await statisticsObjects.push({ date: this.getCurrentDate(), virtualId: process.env.VIRTUALID, twitter: { totalMessagesSent: totalMessagesSent } })
        }
        await fs.writeFileSync(browser.params.statistics, JSON.stringify(statisticsObjects));
    };

    // WORKS FOR INSTAGRAM AND TWITTER
    this.updateTotalStatuses = async(socialNetwork) => {

        let database = await fs.readFileSync(browser.params.db, 'utf8');
        let databaseArrayOfObjects = await JSON.parse(database);
        let databaseArrayOfObjectsWithVirtualId = _.filter(databaseArrayOfObjects, { virtualId: process.env.VIRTUALID });

        let statusPageNotAvailable = 0;
        let statusRequestSent = 0;
        let statusSubscribedNotGreeted = 0;
        let statusSubscribedGreeted = 0;
        let statusAccountDeletedUserBlockedUsOrUnsubscribed = 0;

        if (socialNetwork === 'Instagram') {
            await databaseArrayOfObjectsWithVirtualId.forEach(user => {
                if (user.instagramStatus === "Page is not available") return statusPageNotAvailable += 1;
                if (user.instagramStatus === "Request sent") return statusRequestSent += 1;
                if (user.instagramStatus === "Subscribed, not greeted") return statusSubscribedNotGreeted += 1;
                if (user.instagramStatus === "Subscribed, greeted") return statusSubscribedGreeted += 1;
                if (user.instagramStatus === "Account deleted, user blocked us or unsubscribed") return statusAccountDeletedUserBlockedUsOrUnsubscribed += 1;
            });
        } else if (socialNetwork === 'Twitter') {
            await databaseArrayOfObjectsWithVirtualId.forEach(user => {
                if (user.twitterStatus === "Page is not available") return statusPageNotAvailable += 1;
                if (user.twitterStatus === "Request sent") return statusRequestSent += 1;
                if (user.twitterStatus === "Subscribed, not greeted") return statusSubscribedNotGreeted += 1;
                if (user.twitterStatus === "Subscribed, greeted") return statusSubscribedGreeted += 1;
                if (user.twitterStatus === "Account deleted, user blocked us or unsubscribed") return statusAccountDeletedUserBlockedUsOrUnsubscribed += 1;
            });
        }

        let statuses = {
            "totalPageNotAvailable": statusPageNotAvailable,
            "totalRequestSent": statusRequestSent,
            "totalSubscribedNotGreeted": statusSubscribedNotGreeted,
            "totalSubscribedGreeted": statusSubscribedGreeted,
            "totalAccountDeletedUserBlockedUsOrUnsubscribed": statusAccountDeletedUserBlockedUsOrUnsubscribed,
        };

        let data = await fs.readFileSync(browser.params.statistics, 'utf8');
        let objects = await JSON.parse(data);
        let pickedDay = _.find(objects, {'date': this.getCurrentDate(), virtualId: process.env.VIRTUALID});

        if (pickedDay && socialNetwork === 'Instagram') {
                pickedDay.instagramStatuses = statuses;
        }
        if (pickedDay && socialNetwork === 'Twitter') {
            pickedDay.twitterStatuses = statuses;
        }
        if (!pickedDay && socialNetwork === 'Instagram') {
            await objects.push({date: this.getCurrentDate(), virtualId: process.env.VIRTUALID, instagramStatuses: statuses })
        }
        if (!pickedDay && socialNetwork === 'Twitter') {
            await objects.push({date: this.getCurrentDate(), virtualId: process.env.VIRTUALID, twitterStatuses: statuses })
        }

        await fs.writeFileSync(browser.params.statistics, JSON.stringify(objects));
    };

    this.likeAndPostCommentInstagram = async(url) => {
        const random = Math.floor(Math.random() * comments.length);

        await browser.get(url);
        await browser.wait(EC.visibilityOf(po_instagram_userPage.sendMessageButton), 10000);
        await po_instagram_profile.latestPublication.click();

        let commentLeft = false;
        let totalCommentsLeft = 0;
        let totalLikesLeft = 0;

        await browser.wait(EC.visibilityOf(po_instagram_profile.publicationModal.likeButton), 10000);
        for (let i = 0; i < 10; i++){
            if (commentLeft === false){
                await po_instagram_profile.publicationModal.commentInput.isPresent().then(async(result) => {
                    if (result) { // true
                        await po_instagram_profile.publicationModal.likeButton.getAttribute('aria-label').then(async(likeStatus) => {
                            if (likeStatus === 'Нравится'){
                                await po_instagram_profile.publicationModal.likeButton.click();
                                totalLikesLeft = await totalLikesLeft + 1;
                            }
                        });
                        await po_instagram_profile.publicationModal.commentInput.click();
                        await po_instagram_profile.publicationModal.commentInput.sendKeys(comments[random] + '\n');
                        await browser.wait(EC.visibilityOf(element(by.cssContainingText('span', comments[random]))), 10000);
                        commentLeft = true;
                        totalCommentsLeft = await totalCommentsLeft + 1;

                        let statisticsData = await fs.readFileSync(browser.params.statistics, 'utf8');
                        let statisticsObjects = await JSON.parse(statisticsData);
                        let pickedDay = _.find(statisticsObjects, {'date': this.getCurrentDate(), virtualId: process.env.VIRTUALID});

                        if (pickedDay) {
                            if (pickedDay.instagram.totalCommentsLeft){
                                pickedDay.instagram.totalCommentsLeft = await pickedDay.instagram.totalCommentsLeft + totalCommentsLeft;
                            } else {
                                pickedDay.instagram.totalCommentsLeft = totalCommentsLeft
                            }
                            if (pickedDay.instagram.totalLikesLeft){
                                pickedDay.instagram.totalLikesLeft = await pickedDay.instagram.totalLikesLeft + totalLikesLeft;
                            } else {
                                pickedDay.instagram.totalLikesLeft = totalLikesLeft
                            }
                        } else {
                            await statisticsObjects.push({
                                date: this.getCurrentDate(),
                                virtualId: process.env.VIRTUALID,
                                instagram: {
                                    totalCommentsLeft: totalCommentsLeft,
                                    totalLikesLeft: totalLikesLeft,
                                }
                            })
                        }
                        await fs.writeFileSync(browser.params.statistics, JSON.stringify(statisticsObjects));
                    } else {
                        await po_instagram_profile.publicationModal.nextPublicationArrow.isPresent().then(async(result) => {
                            if (result) { // true
                                await po_instagram_profile.publicationModal.nextPublicationArrow.click();
                                await browser.sleep(2000);
                            }
                        });
                    }
                });
            }
        }
    }

    this.likeAndPostCommentTwitter = async(url) => {
        const random = Math.floor(Math.random() * comments.length);

        await browser.get(url);
        await po_twitter_userPage.loginButtonWhenLoggedOut.isPresent().then(async (result) => {
            if (result) { // true
                await browser.sleep(3000);
                await po_twitter_userPage.loginButtonWhenLoggedOut.click();
                await browser.sleep(3000);
                await browser.get(url);
            }
        });
        await browser.sleep(3000);

        let commentLeft = false;
        let totalCommentsLeft = 0;
        let totalLikesLeft = 0;

        let leaveCommentButtons = $$('[data-testid="tweet"] [data-testid="reply"]');
        let likeButtonForLatestTweet = $$('[data-testid="tweet"]').first().$('[data-testid="like"]');
        await leaveCommentButtons.first().isPresent().then(async(result) => {
            if (result) { // true
                await likeButtonForLatestTweet.isPresent().then(async(result) => {
                    if (result) { // true
                        await likeButtonForLatestTweet.click();
                        totalLikesLeft = await totalLikesLeft + 1;
                    }
                });
                await leaveCommentButtons.first().click();
                let commentInput = $('div.public-DraftStyleDefault-block.public-DraftStyleDefault-ltr span br');
                await browser.sleep(3000);
                await commentInput.sendKeys(comments[random] + '\n');
                let postCommentInModalButton = element(by.cssContainingText('span', 'Reply'));
                await postCommentInModalButton.click();
                commentLeft = true;
                totalCommentsLeft = await totalCommentsLeft + 1;

                let statisticsData = await fs.readFileSync(browser.params.statistics, 'utf8');
                let statisticsObjects = await JSON.parse(statisticsData);
                let pickedDay = _.find(statisticsObjects, {'date': this.getCurrentDate(), virtualId: process.env.VIRTUALID});

                if (pickedDay) {
                    if (pickedDay.twitter.totalCommentsLeft){
                        pickedDay.twitter.totalCommentsLeft = await pickedDay.twitter.totalCommentsLeft + totalCommentsLeft;
                    } else {
                        pickedDay.twitter.totalCommentsLeft = totalCommentsLeft
                    }
                    if (pickedDay.twitter.totalLikesLeft){
                        pickedDay.twitter.totalLikesLeft = await pickedDay.twitter.totalLikesLeft + totalLikesLeft;
                    } else {
                        pickedDay.twitter.totalLikesLeft = totalLikesLeft
                    }
                } else {
                    await statisticsObjects.push({
                        date: this.getCurrentDate(),
                        virtualId: process.env.VIRTUALID,
                        twitter: {
                            totalCommentsLeft: totalCommentsLeft,
                            totalLikesLeft: totalLikesLeft,
                        }
                    })
                }
                await fs.writeFileSync(browser.params.statistics, JSON.stringify(statisticsObjects));
            }
        });
    }

};

module.exports = new utils();