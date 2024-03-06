
let po_instagram_login = function() {

    this.homepageUrl = 'https://www.instagram.com/';
    this.emailInput = $('input[name="username"]');
    this.passwordInput = $('input[name="password"]');
    this.loginButton = element(by.buttonText('Войти'));

};

module.exports = new po_instagram_login();


