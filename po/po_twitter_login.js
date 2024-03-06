const EC = protractor.ExpectedConditions;
const fs = require('fs');
const _ = require('lodash');

let po_twitter_login = function() {

    this.emailInput = $$('input[name="session[username_or_email]"]').first();
    this.passwordInput = $$('input[name="session[password]"]').first();
    this.loginButton = $$('[data-testid="LoginForm_Login_Button"] span span').first();
    this.weNoticedFewText = element(by.cssContainingText('span', 'Мы заметили несколько необычных попыток'));
    this.tweetButton = $('a[data-testid="SideNav_NewTweet_Button"]');

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

    this.loginTwitter = async() => {
        let totalLogins = 0;
        await browser.get('https://twitter.com/login');
        await browser.wait(EC.visibilityOf(this.emailInput), 10000);
        await this.emailInput.sendKeys(browser.params.twitterEmail);
        await this.passwordInput.sendKeys(browser.params.twitterPassword);
        await this.loginButton.click();
        await browser.sleep(2500);
        await this.weNoticedFewText.isPresent().then(async (result) => {
            if (result) { // true
                await this.emailInput.sendKeys(browser.params.twitterUsername);
                await this.passwordInput.sendKeys(browser.params.twitterPassword);
                await this.loginButton.click();
            }
        });
        await browser.wait(EC.visibilityOf(this.tweetButton), 10000);
        totalLogins = await totalLogins + 1;

        let statisticsData = await fs.readFileSync(browser.params.statistics, 'utf8');
        let statisticsObjects = await JSON.parse(statisticsData);
        let statisticsObjectTodayForVirtualId = _.find(statisticsObjects, { date: this.getCurrentDate(), virtualId: process.env.VIRTUALID });

        if (statisticsObjectTodayForVirtualId) {
            if (statisticsObjectTodayForVirtualId.twitter){
                statisticsObjectTodayForVirtualId.twitter.totalLogins = await statisticsObjectTodayForVirtualId.twitter.totalLogins + totalLogins;
            } else {
                statisticsObjectTodayForVirtualId.twitter = { totalLogins: totalLogins }
            }
        } else {
            await statisticsObjects.push({
                date: this.getCurrentDate(),
                virtualId: process.env.VIRTUALID,
                twitter: {
                    totalLogins: totalLogins
                }
            })
        }
        await fs.writeFileSync(browser.params.statistics, JSON.stringify(statisticsObjects));
    }
};

module.exports = new po_twitter_login();


