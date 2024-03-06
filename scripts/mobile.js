const utils = require('../utils/utils.js');
const po_instagram_userPage = require('../po/po_instagram_userPage.js');
const po_instagram_profile = require('../po/po_instagram_profile.js');
const po_instagram_chat = require('../po/po_instagram_chat.js');
const EC = protractor.ExpectedConditions;
const fs = require('fs');
const _ = require('lodash');
const path = require('path');

describe('Comments', () => {

    it('Comments', async () => {

/*        let remote = require('selenium-webdriver/remote');
        await browser.setFileDetector(new remote.FileDetector());
        let signInButtonHomepage = element(by.cssContainingText('button', 'Войти'));
        let emailInput = $('input[name="username"]');
        let passwordInput = $('input[name="password"]');
        let signInButton = element(by.cssContainingText('button div', 'Войти'));
        let doNotSaveButton = element(by.cssContainingText('button', 'Не сейчас'));
        let declineSavingOnMainScren = element(by.cssContainingText('button', 'Отмена'));
        //let newPublication = $('svg[aria-label="Новая публикация"]');
        let newPublication = $('div[data-testid="new-post-button"]');
        let fileToUpload = '../garden.jpg';
        let absolutePath = path.resolve(__dirname, fileToUpload);
        console.log(absolutePath)
        let nextButton = element(by.cssContainingText('button', 'Далее'));
        let enterCommentForImageInput = $('textarea[aria-label="Введите подпись..."]');
        let shareButton = element(by.cssContainingText('button', 'Поделиться'));
        let commentForSharedImageOnHomepage = element.all(by.cssContainingText('span', 'my best photo made in the desert')).first();*/

        await utils.loginInstagram();

        await browser.get('https://www.instagram.com/');
        await po_instagram_chat.notNowButton.isPresent().then(async (result) => {
            if (result) { // true
                await po_instagram_chat.notNowButton.click();
            }
        });

        await $$('article').get(0).$('textarea').sendKeys('Wow!');
        await element.all(by.cssContainingText('button', 'Опубликовать')).first().click();
        await browser.wait(EC.visibilityOf(element.all(by.cssContainingText('span', 'Wow!')).first()), 10000);





        console.log('1')
    });

});