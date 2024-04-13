// роутер отслеживает изменения адресной строки и перенапраляет пользователя на нужные страницы
export class Router {
    constructor() {
        this.initEvents();
            this.routes = [
                {
                    route: '/',
                    title: 'Дашборд',
                    filePathTemplate: ''
                },
                {
                    route: '/404',
                    title: 'Страница не найдена',
                    filePathTemplate: ''
                },
                {
                    route: '/login',
                    title: 'Дашборд',
                    filePathTemplate: ''
                },
                {
                    route: '/sign-up',
                    title: 'Дашборд',
                    filePathTemplate: ''
                },
            ];
    }

    initEvents() {
        window.addEventListener('DOMContentLoaded', this.activateRoute.bind(this)); //отловили загрузку страницы
        window.addEventListener('popstate', this.activateRoute.bind(this)); //отловили переход на другую страницу
    }

    activateRoute() {
        const urlRoute = window.location.pathname;
        const newRoute = this.route.find(item => item === urlRoute);

        if (newRoute) {

        } else {
            console.log('No route found');
            window.location = '/404';
        }
    }
}