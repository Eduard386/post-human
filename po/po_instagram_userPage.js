
let po_instagram_userPage = function() {

    this.pageNotAvailable = element(by.cssContainingText('h2', 'К сожалению, эта страница недоступна.'));
    this.subscribeButton = element(by.cssContainingText('button', 'Подписаться'));
    this.requestSentButton = element(by.cssContainingText('button', 'Запрос отправлен'));
    this.sendMessageButton = element(by.cssContainingText('button', 'Отправить сообщение'));

};

module.exports = new po_instagram_userPage();


