requirejs.config({
    baseUrl: 'src/lib',
    paths: {
        app: '../app'
    }
});

requirejs([`drag-element`, 'app/main']);