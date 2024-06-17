export class FileUtils {
    // функция, которая последовательно создает и возвращает промисы
    // в нашем случае, загружает скрипты на страницу шаблона один за другим
    static loadPageScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve('Script loaded: ' + src);
            script.onerror = () => reject(new Error('Script load error for : ' + src))
            document.body.appendChild(script);
        });
    }

    // функция загрузки стилей
    static loadPageStyle(src, insertBeforeElement) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = src;
        document.head.insertBefore(link, insertBeforeElement)
    }
}
