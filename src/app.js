requirejs.config({
    baseUrl: 'src/lib',
    paths: {
        app: '../app'
    }
});

requirejs(['app/main']);