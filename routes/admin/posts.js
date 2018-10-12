const express = require('express');
const router = express.Router();
const Post = require('../../models/Posts');
const {isEmpty, uploadDir} = require('../../helpers/upload-helper');
const fs = require('fs');
const {userAuthenticated} = require('../../helpers/auth');
// const path = require('path');



router.all('/*', userAuthenticated, (req, res, next) => {
	req.app.locals.layout = 'admin';
	next();
});



router.get('/', (req, res)=>{
	Post.find({}).then(posts => {
	    res.status(200).render('admin/posts', {posts:posts});

	});
});


router.get('/my-posts', (req, res)=>{
	Post.find({user: req.user.id}).then(posts => {

    res.status(200).render('admin/posts/my-posts', {posts:posts});

	});
});


router.get('/create', (req, res)=>{
    res.status(200).render('admin/posts/create');
});



router.get('/edit/:id', (req, res)=>{
	Post.findOne({_id: req.params.id}).then(post => {
	    res.status(200).render('admin/posts/edit', {post:post});
	});
});

router.put('/edit/:id', (req, res)=>{
    Post.findOne({_id: req.params.id}).then(post => {

    if (req.body.allowComments) {
		allowComments = true;	
	} else {
		allowComments = false;
	}

    	post.user = req.user.id;
    	post.title = req.body.title;
    	post.status = req.body.status;
    	post.allowComments = allowComments;
    	post.body = req.body.body;

if(!isEmpty(req.files)){
		let file = req.files.file;
		filename = Date.now() + '-' + file.name;

		post.file = filename;

		file.mv('./public/uploads/' + filename, (err)=>{
		if (err) throw err;
		});
	}


    	post.save().then(updatedPost =>{
			req.flash('success_message', 'Post was successfully updatesd');

    		res.redirect('/admin/posts/my-posts');
    	});
	});
});

router.delete('/:id', (req, res) =>{
	Post.findOne({_id: req.params.id})
		.then(post =>{
			post.remove();
			fs.unlink(uploadDir + post.file, (err)=>{
			req.flash('success_message', 'Post was successfully deleted');
			res.redirect('/admin/posts/my-posts');
			});
		});
});

router.post('/create', (req, res)=>{
	let errors = [];

	if(!req.body.title){
		errors.push({message: 'please Enter a title'});
	}
	if(!req.body.body){
		errors.push({message: 'please add a Description'});
	}
	if(errors.length > 0){
		res.render('admin/posts/create', {
			errors: errors
		});
	}else{

	let filename = "file name should appear here";

	if(!isEmpty(req.files)){
			let file = req.files.file;
			filename = Date.now() + '-' + file.name;

			file.mv('./public/uploads/' + filename, (err)=>{
			if (err) throw err;
			});
		}

	let allowComments = true;

	if (req.body.allowComments) {
		allowComments = true;	
	} else {
		allowComments = false;
	}

	const newPost = new Post({
		user: req.user.id,
		title: req.body.title,
		status: req.body.status,
		allowComments: allowComments,
		body: req.body.body,
		file: filename
	})
     newPost.save().then(savedPost => {

     	req.flash('success_message', 'Post was created successfully' + savedPost.title);
     	res.redirect('/admin/posts');
     }).catch(error => {
     	console.log('Could not save post...', error);
     });

	}

});

	

module.exports = router;
