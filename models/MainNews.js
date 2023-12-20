import mongoose,{Schema} from "mongoose";

const mainNewsSchema = new Schema({
    news: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'news'
    }
})

const mainNews = mongoose.model('mainNews', mainNewsSchema)

export default mainNews