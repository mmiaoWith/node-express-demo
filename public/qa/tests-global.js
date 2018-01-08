suite('Global Tests', function () {
    //先测量， 再调优
    test('page has a valid title', function () {
        assert(document.title && document.title.match(/\S/) &&
            document.title.toUpperCase() !== 'TODO');
    });
})