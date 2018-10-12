const express = require('express');
const app = express();
const path = require('path');
const exphand = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const upload = require('express-fileupload');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');





mongoose.connect('mongodb://localhost:27017/cms', {useNewUrlParser: true}).then(db => {
	console.log('Connection to the database was successfull');
}).catch(error => console.log(error));



app.use(express.static('./public'));

const {select, generateTime, paginate} = require('./helpers/handlebars-helpers');



app.engine('handlebars', exphand({defaultLayout:'home', helpers:{select: select, generateTime: generateTime, paginate: paginate}}));
app.set('view engine', 'handlebars');

app.use(upload());

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(methodOverride('_method'));

app.use(session({
	secret: "pass123",
	resave: true,
	saveUninitialized: true
}));

app.use(flash());

 app.use(passport.initialize());
 app.use(passport.session());

app.use((req, res, next) =>{
	res.locals.user = req.user || null;
	res.locals.success_message = req.flash('success_message');
	res.locals.error_message = req.flash('error_message');
	res.locals.error = req.flash('error');
	next();
})


const home = require('./routes/home/index');
const admin = require('./routes/admin/index');
const posts = require('./routes/admin/posts');
const categories = require('./routes/admin/categories');
const comments = require('./routes/admin/comments');

app.use('/', home);
app.use('/admin', admin);
app.use('/admin/posts', posts);
app.use('/admin/categories', categories);
app.use('/admin/comments', comments);






var port = process.env.PORT || 7000;
app.listen(port, ()=>{
    console.log('now listening on port: ', port);
});
