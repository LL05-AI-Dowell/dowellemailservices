import mongoose from 'mongoose';
import config from '../config/config.js';
import userModel from '../model/userModel.js';
import refreshTokenModel from '../model/refreshTokenModel.js'

export default {
    connect: async () => {
        try {
            await mongoose.connect(config.DATABASE_URL);
            return mongoose.connection;
        } catch (err) {
            throw err;
        }
    },
    findUserByEmailAddress: (email,select) => {
        return userModel
            .findOne({
                email
            })
            .select(select)
    },
    createUser: (userData) => {
        return userModel.create(userData)
    },
    findUserById: (id, select='') => {
        return userModel.findById(id).select(select)
    },
    updateUser: async (id, updateData) => {
        return userModel.findByIdAndUpdate(id, updateData, { new: true });
    },
    createRefreshToken: (payload) => {
        return refreshTokenModel.create(payload)
    },
    deleteRefreshToken: (token) => {
        return refreshTokenModel.deleteOne({ token: token })
    },
    findRefreshToken: (token) => {
        return refreshTokenModel.findOne({ token })
    }
};
