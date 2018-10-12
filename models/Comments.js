const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({

	user:{
		type: Schema.Types.ObjectId,
		ref: 'users'
	},

	 approveComment:{

        type: Boolean,
        default: false


    },


	body:{
		type: String,
		required: true
	}

});

module.exports = mongoose.model('comments', CommentSchema);