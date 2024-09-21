import responseMessage from '../constant/responseMessage.js';
import httpError from '../util/httpError.js';
import quicker from '../util/quicker.js';
import databaseService from '../service/databaseService.js';
import config from '../config/config.js';

export default async (req, res, next) => {
    try {

        const accessToken = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];
    
        if (!accessToken) {
            return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 401);
        }
      
        const { userId } = quicker.verifyToken(accessToken, config.ACCESS_TOKEN.SECRET);
   
        const user = await databaseService.findUserById(userId);


        if (!user) {
            return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 401);
        }

        req.authenticatedUser = user; 
        next(); 
    } catch (err) {
        
        httpError(next, err, req, 500);
    }
};
