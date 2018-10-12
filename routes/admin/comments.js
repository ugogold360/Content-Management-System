const express = require('express');
const router = express.Router();
const Posts = require('../../models/Posts');
const Comments = require('../../models/Comments');
const {userAuthenticated} = require('../../helpers/auth');


router.all('/*', userAuthenticated, (req, res, next)=>{


    req.app.locals.layout = 'admin';
    next();


});





router.get('/', (req, res)=>{

    Comments.find({user: req.user.id}).populate('user')

        .then(comments=>{

        res.render('admin/comments', {comments: comments});

    });


});



router.post('/', (req, res)=>{


    Posts.findOne({_id: req.body.id}).then(post=>{


        const newComment = new Comments({

            user: req.user.id,
            body: req.body.body

        });



        post.comments.push(newComment);

        post.save().then(savedPost=>{

            newComment.save().then(savedComment=>{

            req.flash('success_message', 'Comments Created. Would appear affect review');

                res.redirect(`/post/${post.id}`);


            })



        });


    });



});



router.delete('/:id', (req, res)=>{


    Comments.remove({_id: req.params.id}).then(deleteItem=>{

        Posts.findOneAndUpdate({comments: req.params.id}, {$pull: {comments: req.params.id}}, (err, data)=>{

           if(err) console.log(err);

            res.redirect('/admin/comments');

              });

        });

});



router.post('/approve-comment', (req, res)=>{


    Comments.findByIdAndUpdate(req.body.id, {$set: {approveComment: req.body.approveComment}}, (err, result)=>{


        if(err) return err;


        res.send(result)


    });



});













module.exports = router;