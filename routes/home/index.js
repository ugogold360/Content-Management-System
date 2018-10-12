const express = require('express');
const router = express.Router();
const Category = require('../../models/Category');
const Post = require('../../models/Posts');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;


router.all('/*', (req, res, next) => {
	req.app.locals.layout = 'home';
	next();
});


router.get('/', (req, res)=>{

	const perPage = 10;
    const page = req.query.page || 1;

	Post.find({})

	 .skip((perPage * page) - perPage)
     .limit(perPage)
	 .then(posts => {

	 	Post.count().then(postCount => {
			res.render('home/index', {
				posts:posts,
				current: parseInt(page),
                pages: Math.ceil(postCount / perPage)

			});
	});
	});
});

router.get('/about', (req, res)=>{
    res.status(200).render('home/about');
});

router.get('/login', (req, res)=>{
    res.status(200).render('home/login');
});

router.get('/logout', (req, res)=>{
	req.logOut();
    res.redirect('/login');
});

router.get('/register', (req, res)=>{
    res.status(200).render('home/register');
});


router.get('/post/:slug', (req, res)=>{

    Post.findOne({slug: req.params.slug})

        .populate({path: 'comments', match:{approveComment: true}, populate: {path: 'user', model: 'users'}})
        .populate('user')

        .then(post =>{

            Category.find({}).then(categories=>{

                res.render('home/post', {post: post, categories: categories});

            });


        });

});

passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done) => {

	User.findOne({email: email}).then(user => {
		if (!user) return done(null, false, {message: 'No user found'});

		bcrypt.compare(password, user.password, (err, matched) => {
			if(err) return err;

			if(matched){
				return done( null, user);
			}else{
				return done(null, false, {message: 'Incorrect Password'});
			}
		})

	})

}));


passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	User.findById(id, function(err, user) {
		done(err, user);
	})
});




router.post('/login', (req, res, next)=>{

	passport.authenticate('local', {
		successRedirect: '/admin/posts',
		failureRedirect: '/login',
		failureFlash: true

	})(req, res, next);
});





router.post('/register', (req, res)=>{

	let errors = [];

	if(!req.body.firstName){
		errors.push({message: 'please add a firstName'});
	}


	if(!req.body.lastName){
		errors.push({message: 'please add a lastName'});
	}

	if(!req.body.email){
		errors.push({message: 'please add an email'});
	}
	if(!req.body.password){
		errors.push({message: 'please add an Password'});
	}
	if(!req.body.passwordConfirm){
		errors.push({message: 'please confirm Password'});
	}

	if(req.body.password !== req.body.passwordConfirm){
		errors.push({message: 'Password Do Not Match'});
	}


	if(errors.length > 0){
		res.render('home/register', {
			errors: errors,
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			email: req.body.email,
		});
	}else{

		User.findOne({email: req.body.email}).then(user => {
			if(!user){

				const newUser = new User({
						firstName: req.body.firstName,
						lastName: req.body.lastName,
						email: req.body.email,
						password: req.body.password
					});

					bcrypt.genSalt(10, (err, salt) => {
						bcrypt.hash(newUser.password, salt, (err, hashed) => {
							newUser.password = hashed;

					newUser.save().then(savedUser =>{
						req.flash('success_message', 'You are now registered, please login');
							res.redirect('/login');
						});
					});
				});

			}else{

				req.flash('error_message', 'User with that email already exists');
				res.redirect('/login');
			}
		});

		

		
	}
});



router.get('/post/:id', (req, res)=>{

	Post.findOne({_id: req.params.id})
		.then(post =>{
			res.render('home/post', {post:post});
		});
});



module.exports = router;