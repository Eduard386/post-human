const EC = protractor.ExpectedConditions;

let po_instagram_profile = function() {

    this.subscriptionsLink = $('.Y8-fY a[href$="/following/"]');
    this.subscriptionsList = $$('.PZuss a[title]');
    this.latestPublication = $$('article a').first();

    this.publicationModal = {
        likeButton: $$('article section button svg').first(),
        commentInput: $('textarea[aria-label="Добавьте комментарий..."]'),
        nextPublicationArrow: $('a.coreSpriteRightPaginationArrow')
    };

    this.openSubscriptionsModal = async() => {
        await this.subscriptionsLink.click();
        await browser.wait(EC.visibilityOf(element(by.cssContainingText('h1', 'Ваши подписки'))), 10000);
        await browser.sleep(1000);
    };

    this.getArrayOfSubscriptionsLinks = async() => {
        let arrayOfSubscriptionsLinks = [];
        await this.subscriptionsList.each(async(element) => {
            await element.getAttribute('href').then(async(href) => {
                await arrayOfSubscriptionsLinks.push(href);
            });
        });
        return arrayOfSubscriptionsLinks;
    };


};

module.exports = new po_instagram_profile();


