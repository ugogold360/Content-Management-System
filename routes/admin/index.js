const express = require('express');
const Post = require('../../models/Posts');
const {userAuthenticated} = require('../../helpers/auth');

const faker = require('faker');

const router = express.Router();

router.all('/*', userAuthenticated, (req, res, next) => {
	req.app.locals.layout = 'admin';
	next();
});

router.get('/', (req, res)=>{
    Post.count({}).then(postCount =>{
        res.status(200).render('admin/index', {postCount: postCount});
    });
});

router.post('/generate-fake-posts', (req, res)=>{
    for (let i = 0; i < req.body.amount; i++) {
    	
    	let post = new Post();

    	post.title = faker.name.title();
        post.status = 'public';
    	post.slug = faker.name.title();
    	post.allowComments = faker.random.boolean();
    	post.body = faker.lorem.sentence();

    	post.save(function (err){
    		if (err) throw err;
    	});
	    	res.redirect('/admin/Posts');
    }
});



module.exports = router;