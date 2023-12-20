import mongoose,{ Schema } from 'mongoose';

const newsSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    date:{
        type: Date
    },
    image:{
        type: String
    },
    paragraphs: [{
        type: String
    }]
})

const news = mongoose.model('news',newsSchema)

export default news