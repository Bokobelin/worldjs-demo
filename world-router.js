// world-router.js
class WorldRouter {
    constructor() {
        this.routes = {};
        this.deferredHTML = [];
        this.deferredJS = [];
        this.baseUrl = this.getBaseUrl();
        this.init();
    }

    getBaseUrl() {
        const base = document.querySelector('base');
        if (base && base.href) {
            return base.href;
        }
        return `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    }

    init() {
        window.addEventListener('popstate', () => this.handleRoute());
        this.interceptLinks();
        this.handleRoute();
        
        document.addEventListener('DOMContentLoaded', () => this.runDeferredFunctions('HTML'));
        window.addEventListener('load', () => this.runDeferredFunctions('JS'));
    }

    addRoute(path, component) {
        this.routes[path] = component;
    }

    addRoutePage(path, filePath) {
        this.routes[path] = async () => {
            try {
                const fullPath = new URL(filePath, this.baseUrl).href;
                const response = await fetch(fullPath);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const html = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                return doc.body.innerHTML;
                
            } catch (error) {
                console.error('Error loading page:', error);
                return '<h1>Error loading page</h1>';
            }
        };
    }

    async handleRoute() {
        const path = window.location.pathname;
        const component = this.routes[path] || this.notFound;
        let content;
        if (typeof component === 'function') {
            content = await component();
        } else {
            content = component;
        }
        document.getElementById('app').innerHTML = content;
        
        this.runDeferredFunctions('HTML');
    }

    navigate(path) {
        window.history.pushState({}, '', path);
        this.handleRoute();
    }

    interceptLinks() {
        document.body.addEventListener('click', (e) => {
            if (e.target.matches('.nav-link')) {
                e.preventDefault();
                this.navigate(e.target.getAttribute('href'));
            }
        });
    }

    notFound() {
        return '<h1>404 - Page Not Found</h1>';
    }

    defer(type, func) {
        if (type === 'HTML') {
            this.deferredHTML.push(func);
        } else if (type === 'JS') {
            this.deferredJS.push(func);
        } else {
            console.error('Invalid defer type. Use "HTML" or "JS".');
        }
    }

    runDeferredFunctions(type) {
        let functions = type === 'HTML' ? this.deferredHTML : this.deferredJS;
        functions.forEach(func => func());
        
        if (type === 'HTML') {
            this.deferredHTML = [];
        } else {
            this.deferredJS = [];
        }
    }
}