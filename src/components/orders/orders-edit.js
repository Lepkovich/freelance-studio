import {HttpUtils} from "../../utils/http-utils";

export class OrdersEdit {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        if (!id) {
            return this.openNewRoute('/');
        }

        document.getElementById('updateButton').addEventListener('click', this.updateOrder.bind(this));

        this.freelancerSelectElement = document.getElementById('freelancerSelect');
        this.descriptionInputElement = document.getElementById('descriptionInput');
        this.amountInputElement = document.getElementById('amountInput');
        this.statusSelectElement = document.getElementById('statusSelect');
        this.scheduledCardElement = document.getElementById('scheduled-card');
        this.deadlineCardElement = document.getElementById('deadline-card');


        this.init(id).then();

    }

    //нам нужен асинхронный запрос двух функций (по очереди), но мы не можем их вызывать из конструктора
    //поэтому сделали отдельную функцию init, которую вызываем из конструктора
    async init(id) {
        const orderData = await this.getOrder(id);
        if (orderData) {
            this.showOrder(orderData);
            if (orderData.freelancer) {
                await this.getFreelancers(orderData.freelancer.id).then();
            }
        }
    }

    async getOrder(id) {
        const result = await HttpUtils.request('/orders/' + id);
        if (result.redirect) {
            return  this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && result.response.error)) {
            console.log(result.response.message);
            return alert('Возникла ошибка при запросе заказа.');
        }

        this.orderOriginalData = result.response;

        return result.response;
    }

    showOrder(order) {

        //заполняем хлебные крошки
        const breadcrumbsElement = document.getElementById('breadcrumbs-order');
        if (order.id && order.number) {
            breadcrumbsElement.innerText = order.number;
            breadcrumbsElement.href = '/orders/view?id=' + order.id
        }

        //заполняем инпуты
        this.amountInputElement.value = order.amount;
        this.descriptionInputElement.value = order.description;


        // подставим нужный статус в select-поле
        for (let i = 0; i < this.statusSelectElement.options.length; i++) {
            if (this.statusSelectElement.options[i].value === order.status) {
                this.statusSelectElement.selectedIndex = i;
            }
        }

        // инициализируем календари и подставляем дату из бэкенда
        const calendarScheduled = $('#calendar-scheduled');
        this.scheduledDate = null;

        calendarScheduled.datetimepicker({
            inline: true,
            locale: 'ru',
            icons: {
                time: 'far fa-clock'
            },
            useCurrent: false,
            date: order.scheduledDate
        });
        calendarScheduled.on("change.datetimepicker", (e) => {
            this.scheduledDate = e.date
        });

        const calendarComplete = $('#calendar-complete');
        this.completeDate = null;

        calendarComplete.datetimepicker({
            inline: true,
            locale: 'ru',
            icons: {
                time: 'far fa-clock'
            },
            buttons: {
                showClear: true
            },
            useCurrent: false,
            date: order.completeDate
        });
        calendarComplete.on("change.datetimepicker", (e) => {

            if (e.date) {
                this.completeDate = e.date
            } else if (this.orderOriginalData.completeDate) {
                this.completeDate = false;
            } else {
                this.completeDate = null;
            }

        });

        const calendarDeadline = $('#calendar-deadline');
        this.deadlineDate = null;

        calendarDeadline.datetimepicker({
            inline: true,
            locale: 'ru',
            icons: {
                time: 'far fa-clock'
            },
            useCurrent: false,
            date: order.deadlineDate
        });
        calendarDeadline.on("change.datetimepicker", (e) => {
            this.deadlineDate = e.date
        });
    }

    //забираем всех фрилансеров с бэкенда, чтобы подставить в селект
    async getFreelancers(currentFreelancerId) {
        const result = await HttpUtils.request('/freelancers');
        if (result.redirect) {
            return  this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && (result.response.error || !result.response.freelancers))) {
            return alert('Возникла ошибка при запросе фрилансеров.');
        }

        const freelancers = result.response.freelancers;

        for (let i = 0; i < freelancers.length; i++) {
            const option = document.createElement('option');
            option.value = freelancers[i].id;
            option.innerText = freelancers[i].name + ' ' + freelancers[i].lastName;
            if (currentFreelancerId === freelancers[i].id) {
                option.selected = true;
            }
            this.freelancerSelectElement.appendChild(option);
        }

        //Initialize Select2 Elements
        $(this.freelancerSelectElement).select2({
            theme: 'bootstrap4'
        })

    }

    validateForm() {
        let isValid = true;

        let textInputArray = [this.descriptionInputElement, this.amountInputElement];

        for (let i = 0; i < textInputArray.length; i++) {
            if (textInputArray[i].value) {
                textInputArray[i].classList.remove('is-invalid');
            } else {
                textInputArray[i].classList.add('is-invalid');
                isValid = false;
            }
        }

        return isValid;
    }

    async updateOrder(e) {
        e.preventDefault();
        if (this.validateForm()){
            const changedData = {};

            //добавим в changedData только те поля, что были изменены
            if (parseInt(this.amountInputElement.value)  !== parseInt(this.orderOriginalData.amount) ) {
                changedData.amount = parseInt(this.amountInputElement.value);
            }
            if (this.descriptionInputElement.value !== this.orderOriginalData.description) {
                changedData.description = this.descriptionInputElement.value;
            }
            if (this.statusSelectElement.value !== this.orderOriginalData.status) {
                changedData.status = this.statusSelectElement.value;
            }
            if (this.freelancerSelectElement.value !== this.orderOriginalData.freelancer.id) {
                changedData.freelancer = this.freelancerSelectElement.value;
            }
            if (this.completeDate || this.completeDate === false) {
                changedData.completeDate = this.completeDate ? this.completeDate.toISOString() : null;
            }
            if (this.deadlineDate) {
                changedData.deadlineDate = this.deadlineDate .toISOString();
            }
            if (this.scheduledDate) {
                changedData.scheduledDate = this.scheduledDate .toISOString();
            }

            //проверим не остался ли наш объект пустым
            if (Object.keys(changedData).length > 0) {

                //отправим на обновление только измененные значения
                const result = await HttpUtils.request('/orders/' + this.orderOriginalData.id, 'PUT', true, changedData);
                if (result.redirect) {
                    return  this.openNewRoute(result.redirect);
                }
                if (result.error || !result.response || (result.response && result.response.error)) {
                    console.log(result.response.message);
                    return alert('Возникла ошибка при редактировании заказа.');
                }

                return  this.openNewRoute('/orders/view?id=' + this.orderOriginalData.id);
            }
        }
    }
}