
let po_instagram_chat = function() {

    this.notNowButton = element(by.cssContainingText('button', 'Не сейчас'));
    this.messageInput = $('textarea[placeholder="Напишите сообщение..."]');

};

module.exports = new po_instagram_chat();


