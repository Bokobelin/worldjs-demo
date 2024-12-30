class WorldRPCRouter {
    constructor() {
        this.routes = {}; // To store routes and their corresponding actions

        // Listen for popstate event to handle browser navigation
        window.addEventListener('popstate', (event) => {
            this.handleRoute(window.location.pathname);
        });
    }

    // Method to add a route and the corresponding function
    addActionRoute(route, action) {
        this.routes[route] = action;
    }

    navigateTo(route, data = null) {
        const query = data ? `?data=${encodeURIComponent(JSON.stringify(data))}` : '';
        window.history.pushState(data, '', route + query);
        this.handleRoute(route, data);
    }

    handleRoute(route) {
        const url = new URL(window.location.href);
        const data = url.searchParams.get('data') ? JSON.parse(decodeURIComponent(url.searchParams.get('data'))) : null;
        if (this.routes[route]) {
            this.routes[route](data);
        } else {
            console.warn(`Route ${route} is not defined.`);
        }
    }
}
