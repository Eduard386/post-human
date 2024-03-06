
let po_twitter_userPage = function() {

    this.accountDoestExistMessage = element(by.cssContainingText('span', 'This account doesn’t exist'));
    this.sendMessageButton = $('div[aria-label="Message"] div');
    this.followButton = $('[data-testid="placementTracking"] span span');
    this.loginButtonWhenLoggedOut = $('a[href="/login"][role="button"] div[dir="auto"] span span');


};

module.exports = new po_twitter_userPage();


