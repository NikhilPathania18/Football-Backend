import mongoose, { Schema } from 'mongoose'

const userSchema = new Schema({
    name: {
        type: String 
    },
    email: {
        type: String 
    },
    phone: {
        type: String 
    },
    password:{
        type: String
    },
    role:{
        type: String,
        enum: ['scorer','admin'],
        default: 'scorer'
    }
})

const user = mongoose.model('user', userSchema)

export default user;