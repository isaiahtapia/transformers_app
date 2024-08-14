const { model, Schema } = require('mongoose');
const { hash, compare } = require('bcrypt');

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        //Make sure to drop the user collection if it already exists to make the unique functionality work
        unique: true,
        validate: {
            validator(value) {
                //Validates that the string the user types is a valid email string
                return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value);
            }
        }

    },
    password: {
        type: String,
        required: true,
        minLength: [6, 'Your password mus be at 6 characters in length']
    },

    autobots: [{
        type: Schema.Types.ObjectId,
        ref: 'Autobot'
    }]
}, {
    // Edit the user's object before it gets sent out in a JSON response to the browser/client
    toJSON: {
        transform(jsonVal) {
            delete jsonVal.password;
            delete jsonVal.__v;

            return jsonVal;
        }
    }

});

userSchema.pre('save', async function () {
    //Check if this a newly created user and not just a user update
    if (this.isNew) {
        this.password = await hash(this.password, 10);
    }
})

userSchema.methods.validatePassword = async function (formPassword) {
    const is_valid = await compare(this.password, formPassword);

    return is_valid;
}

const User = model('User', userSchema);

module.exports = User;
