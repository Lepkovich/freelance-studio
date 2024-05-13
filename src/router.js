// роутер отслеживает изменения адресной строки и перенаправляет пользователя на нужные страницы
import {Dashboard} from "./components/dashboard";
import {Login} from "./components/login";
import {SignUp} from "./components/sign-up";

export class Router {
    constructor() {
        this.titlePageElement = document.getElementById('title');
        this.contentPageElement = document.getElementById('content');
        this.adminLteStyleElement = document.getElementById('adminlte_style');

        this.initEvents();
        this.routes = [
            {
                route: '/',
                title: 'Дашборд',
                filePathTemplate: '/templates/dashboard.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new Dashboard();
                }
            },
            {
                route: '/404',
                title: 'Страница не найдена',
                filePathTemplate: '/templates/404.html',
                useLayout: false,
            },
            {
                route: '/login',
                title: 'Авторизация',
                filePathTemplate: '/templates/login.html',
                useLayout: false,
                load: () => {
                    // добавили нужные для этой страницы классы к body
                    document.body.classList.add('login-page');
                    document.body.style.height = '100vh';
                    // -----
                    new Login();
                },
                unload: () => {
                    //удалим добавленные классы перед обновлением шаблона
                    document.body.classList.remove('login-page');
                    document.body.style.height = 'auto';
                },
                styles: ['icheck-bootstrap.min.css']
            },
            {
                route: '/sign-up',
                title: 'Регистрация',
                filePathTemplate: '/templates/sign-up.html',
                useLayout: false,
                load: () => {
                    // добавили нужные для этой страницы классы к body
                    document.body.classList.add('register-page');
                    document.body.style.height = '100vh';
                    // -----
                    new SignUp();
                },
                unload: () => {
                    //удалим добавленные классы перед обновлением шаблона
                    document.body.classList.remove('register-page');
                    document.body.style.height = 'auto';
                },
                styles: ['icheck-bootstrap.min.css']
            },
        ];
    }

    initEvents() {
        window.addEventListener('DOMContentLoaded', this.activateRoute.bind(this)); //отловили загрузку страницы
        window.addEventListener('popstate', this.activateRoute.bind(this)); //отловили переход на другую страницу
        document.addEventListener('click', this.openNewRoute.bind(this)) //ловим все клики по странице
    }

    async openNewRoute(e) {

        let element = null;
        if (e.target.nodeName === 'A') {
            element = e.target;
        } else if (e.target.parentNode.nodeName === 'A') {
            element = e.target.parentNode;
        }

        if (element) {
            e.preventDefault();
            const url = element.href.replace(window.location.origin, ''); // уберем из адреса http://localhost...
            if (!url || url === '/#' || url.startsWith('javascript:void(0)')) {
                return;
            }

            const currentRoute = window.location.pathname;
            history.pushState({}, '', url); //обновим url адрес в адресной строке
            await this.activateRoute(null, currentRoute);
        }
    }

    async activateRoute(e, oldRoute = null) {

        if (oldRoute) {
            const currentRoute = this.routes.find(item => item.route === oldRoute);
            if (currentRoute.styles && currentRoute.styles.length > 0) {
                currentRoute.styles.forEach(style => {
                    document.querySelector(`link[href='/css/${style}']`).remove(); //удаляем добавленные стили предыдущего роута
                })
            }
            // выполним удаление добавленных классов
            if (currentRoute.unload && typeof currentRoute.unload === 'function') {
                currentRoute.unload();
            }
        }
        const urlRoute = window.location.pathname;
        const newRoute = this.routes.find(item => item.route === urlRoute);

        if (newRoute) {
            if (newRoute.styles && newRoute.styles.length > 0) {
                newRoute.styles.forEach(style => {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = '/css/' + style;
                    document.head.insertBefore(link, this.adminLteStyleElement)
                })
            }
            if (newRoute.title) {
                this.titlePageElement.innerText = newRoute.title + ' | Freelance Studio';
            }

            if (newRoute.filePathTemplate) {
                let contentBlock = this.contentPageElement;
                if (newRoute.useLayout) {
                    this.contentPageElement.innerHTML = await fetch(newRoute.useLayout).then(response => response.text());
                    contentBlock =  document.getElementById('content-layout');
                    document.body.classList.add('sidebar-mini');
                    document.body.classList.add('layout-fixed');
                }
                else {
                    document.body.classList.remove('sidebar-mini');
                    document.body.classList.remove('layout-fixed');
                }
                contentBlock.innerHTML = await fetch(newRoute.filePathTemplate).then(response => response.text())
            }

            if (newRoute.load && typeof newRoute.load === 'function') {
                newRoute.load();
            }
        } else {
            console.log('No route found');
            history.pushState({}, '', '/404'); //подставим /404 в адресную строку
            await this.activateRoute();
        }
    }
}