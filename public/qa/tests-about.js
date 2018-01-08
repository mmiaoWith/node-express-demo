suite('"About" Page Tests', function () {
    test('page should contains link to contact page', function () {
        assert($('a[href="/contact"]').length);
    });
})