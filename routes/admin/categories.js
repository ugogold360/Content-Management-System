const express = require('express');
const Category  = require('../../models/Category');
const {userAuthenticated} = require('../../helpers/auth');
const router = express.Router();

router.all('/*', userAuthenticated, (req, res, next) => {
	req.app.locals.layout = 'admin';
	next();
});

router.get('/', (req, res)=>{
	Category.find({}).then(categories => {
	    res.status(200).render('admin/categories', {categories:categories});
	});
});

router.post('/create', (req, res)=>{

	const newCategory = new Category({
		name: req.body.name
	});

	newCategory.save().then(savedCategory =>{
    res.status(200).render('admin/categories');
	});
});


module.exports = router;