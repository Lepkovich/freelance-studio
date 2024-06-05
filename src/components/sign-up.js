import {AuthUtils} from "../utils/auth-utils";
import {HttpUtils} from "../utils/http-utils";

export class SignUp {

    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        if (AuthUtils.getAuthInfo(AuthUtils.accessTokenKey)) {
            return this.openNewRoute('/'); //если уже залогинены и в localStorage хранится accessToken, на signup не переходим
        }

        // найдем наши поля формы
        this.nameElement = document.getElementById('name');
        this.lastNameElement = document.getElementById('lastName');
        this.emailElement = document.getElementById('email');
        this.passwordElement = document.getElementById('password');
        this.passwordRepeatElement = document.getElementById('password-repeat');
        this.agreeElement = document.getElementById('agree');
        this.commonErrorElement = document.getElementById('common-error');

        //на кнопку с id="process-button" повесим обработчик клика с вызовом signUp() и передачей контекста this
        document.getElementById('process-button').addEventListener('click', this.signUp.bind(this));
    }

    validateForm() {
        let isValid = true;

        if (this.nameElement.value) {
            this.nameElement.classList.remove('is-invalid');
        } else {
            this.nameElement.classList.add('is-invalid');
            isValid = false;
        }

        if (this.lastNameElement.value) {
            this.lastNameElement.classList.remove('is-invalid');
        } else {
            this.lastNameElement.classList.add('is-invalid');
            isValid = false;
        }

        if (this.emailElement.value && this.emailElement.value.match(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/)) {
            this.emailElement.classList.remove('is-invalid');
        } else {
            this.emailElement.classList.add('is-invalid');
            isValid = false;
        }
        if (this.passwordElement.value && this.passwordElement.value.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/))
            // /^
            // (?=.*\d)          // should contain at least one digit
            // (?=.*[a-z])       // should contain at least one lower case
            // (?=.*[A-Z])       // should contain at least one upper case
            // [a-zA-Z0-9]{8,}   // should contain at least 8 from the mentioned characters
            // $/

            {
            this.passwordElement.classList.remove('is-invalid');
        } else {
            this.passwordElement.classList.add('is-invalid');
            isValid = false;
        }

        if (this.passwordRepeatElement.value && this.passwordRepeatElement.value === this.passwordElement.value) {
            this.passwordRepeatElement.classList.remove('is-invalid');
        } else {
            this.passwordRepeatElement.classList.add('is-invalid');
            isValid = false;
        }

        if (this.agreeElement.checked) {
            this.agreeElement.classList.remove('is-invalid');
        } else {
            this.agreeElement.classList.add('is-invalid');
            isValid = false;
        }

        return isValid;
    }

    async signUp() {

        this.commonErrorElement.style.display = 'none';

        if (this.validateForm()) {

            const result = await HttpUtils.request('/signup', "POST", {
                name: this.nameElement.value,
                lastName: this.lastNameElement.value,
                email: this.emailElement.value,
                password: this.passwordElement.value,
            });


            if (result.error || !result.response || (result.response && (!result.response.accessToken || !result.response.refreshToken || !result.response.id || !result.response.name))) {
                this.commonErrorElement.style.display = 'block';
                return;
            }

            AuthUtils.setAuthInfo(result.response.accessToken, result.response.refreshToken, {id: result.response.id, name: result.response.name});

            this.openNewRoute('/');
        }
    }
}