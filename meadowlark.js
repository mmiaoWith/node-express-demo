var experess = require('express');

var app = experess();

var handlebars = require('express3-handlebars').create({
    defaultLayout:'main',
    helpers: {
        section: function (name, options) {
            if(! this._section)
                this._section = {};
            this._section[name] = options.fn(this);
            return null;
        }
    }
});

var fortune = require('./lib/fortune.js');

app.engine('handlebars', handlebars.engine);

app.set('view engine','handlebars');

app.use(require('body-parser')());
var credentials = require('./lib/credentials.js');
app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')());

var formidable = require('formidable');
app.get('/contest/vacation-photo',function(req,res){
    var now = new Date();
    res.render('contest/vacation-photo',{
        year: now.getFullYear(),
        month: now.getMonth()
    });
});
app.post('/contest/vacation-photo/:year/:month', function(req, res){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files){
        if(err) return res.redirect(303, '/error');
        console.log('received fields:');
        console.log(fields);
        console.log('received files:');
        console.log(files);
        res.redirect(303, '/thank-you');
    });
});

function getWeatherData(){
    return {
        locations: [
            {
                name: 'Portland',
                forecastUrl: 'http://www.wunderground.com/US/OR/Portland.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
                weather: 'Overcast',
                temp: '54.1 F (12.3 C)',
            },
            {
                name: 'Bend',
                forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
                weather: 'Partly Cloudy',
                temp: '55.0 F (12.8 C)',
            },
            {
                name: 'Manzanita',
                forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/rain.gif',
                weather: 'Light Rain',
                temp: '55.0 F (12.8 C)',
            },
        ],
    };
}

app.set('port', process.env.PORT || 5000);

app.use(experess.static(__dirname + '/public'));

app.use(function(req, res, next){
// 如果有即显消息，把它传到上下文中，然后清除它
    res.locals.flash = req.session.flash;
    delete req.session.flash;
    next();
});

app.use(function (req, res, next) {
    res.locals.showTests = app.get('env') !== 'production' &&
        req.query.test === '1';
    next();
});

app.use(function (req, res,next) {
    res.cookie('monster', 'nom nom');
    if(!res.locals.partials)
        res.locals.partials = {};
    res.locals.partials.weather = getWeatherData();
    next();
})

app.get('/about',function (req, res) {
    req.session.userName = 'Anonymous';
    var colorScheme = req.session.colorScheme || 'dark';
    console.log(colorScheme);
    res.render('about', {
        fortune: fortune.getFortune(),
        pageTestScript: '/qa/tests-about.js'
    });
});

app.get('/tours/hood-river', function (req, res) {
    res.render('tours/hood-river');
});

app.get('/tours/request-group-rate', function (req, res) {
    res.render('tours/request-group-rate');
});

app.get('/tours/oregon-coast', function (req, res) {
    res.render('tours/oregon-coast');
});

app.get('/nursery-rhyme', function(req, res){
    res.render('nursery-rhyme');
});
app.get('/data/nursery-rhyme', function(req, res){
    res.json({
        animal: 'squirrel',
        bodyPart: 'tail',
        adjective: 'bushy',
        noun: 'heck',
    });
});

app.post('/newsletter', function(req, res){
    var name = req.body.name || '', email = req.body.email || '';
// 输入验证
    if(!email.match(VALID_EMAIL_REGEX)) {
        if(req.xhr) return res.json({ error: 'Invalid name email address.' });
        req.session.flash = {
            type: 'danger',
            intro: 'Validation error!',
            message: 'The email address you entered was not valid.'
        };
        return res.redirect(303, '/newsletter/archive');
    }
    new NewsletterSignup({ name: name, email: email }).save(function(err){
        if(err) {
            if(req.xhr) return res.json({ error: 'Database error.' });
            req.session.flash = {
                type: 'danger',
                intro: 'Database error!',
                message: 'There was a database error; please try again later.',
            }
            return res.redirect(303, '/newsletter/archive');
        }
        if(req.xhr) return res.json({ success: true });
        req.session.flash = {
            type: 'success',
            intro: 'Thank you!',
            message: 'You have now been signed up for the newsletter.',
        };
        return res.redirect(303, '/newsletter/archive');
    });
});

app.post('/process', function(req, res){
    // console.log('Form (from querystring): ' + req.query.form);
    // console.log('CSRF token (from hidden form field): ' + req.body._csrf);
    // console.log('Name (from visible form field): ' + req.body.name);
    // console.log('Email (from visible form field): ' + req.body.email);
    // res.redirect(303, '/thank-you');
    if(req.xhr || req.accepts('json,html')==='json'){
// 如果发生错误，应该发送 { error: 'error description' }
        res.send({ success: true });
    } else {
// 如果发生错误，应该重定向到错误页面
        res.redirect(303, '/thank-you');
    }
});

app.get('/',function (req, res) {
    res.render('home');
});

app.use(function (req, res) {
    res.status(404);
    res.render('404');
});

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'),function () {
    console.log('Express started on http://localhost:' + app.get('port') + ';Press CTRL+C to terminate.');
});
