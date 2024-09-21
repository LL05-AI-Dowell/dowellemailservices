import httpResponse from '../util/httpResponse.js';
import responseMessage from '../constant/responseMessage.js';
import httpError from '../util/httpError.js';
import quicker from '../util/quicker.js';
import { validateJoiSchema, emailSchema, loginSchema } from '../service/validationService.js';
import databaseService from '../service/databaseService.js';
import config from '../config/config.js'

export default {
    self: (req, res, next) => {
        try {
            httpResponse(req, res, 200, responseMessage.SUCCESS);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },
    health: (req, res, next) => {
        try {
            const healthData = {
                application: quicker.getApplicationHealth(),
                system: quicker.getSystemHealth(),
                timestamp: Date.now(),
            };

            httpResponse(req, res, 200, responseMessage.SUCCESS, healthData);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },
    verifyEmailAddress: async (req, res, next) => {
        try {
            const { email } = req.body;
            const user = req.authenticatedUser;
    
            if (!user) {
                return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 401);
            }
    
            const { error, value } = validateJoiSchema(emailSchema, { email });
            if (error) {
                return httpError(next, error, req, 422);
            }
    
            const isEmailValid = await quicker.verifyEmail(value.email);
            if (!isEmailValid) {
                return httpError(next, responseMessage.PRFORM_VALIDATION_ERROR, req, 422);
            }
            
            user.usageDetails.usageCount += 1;
            user.usageDetails.usageDates.push(new Date());
            user.totalUsedTime += 1;
    
            if (user.totalUsedTime > user.maximumAllowedTime) {
                return httpResponse(req, res, 404, responseMessage.MAXIMUM_TIME_CONSUMED);
            }

            await databaseService.updateUser(user._id, {
                totalUsedTime: user.totalUsedTime,
                usageDetails: {
                    usageCount: user.usageDetails.usageCount,
                    usageDates: user.usageDetails.usageDates,
                },
            });
    
    
            return httpResponse(req, res, 200, responseMessage.SUCCESS, { isEmailValid });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },
    login: async (req, res, next) => {
        try {
            const { email } = req.body;
    
            const { error } = validateJoiSchema(loginSchema, { email });
            if (error) {
                return httpError(next, error, req, 422);
            }
            
            const existingUser = await databaseService.findUserByEmailAddress(email);

            console.log(existingUser);
            
    
            let accessToken, refreshToken;
    
            if (existingUser) {
                accessToken = quicker.generateToken(
                    { userId: existingUser.id },
                    config.ACCESS_TOKEN.SECRET,
                    config.ACCESS_TOKEN.EXPIRY
                );
    
                refreshToken = quicker.generateToken(
                    { userId: existingUser.id },
                    config.REFRESH_TOKEN.SECRET,
                    config.REFRESH_TOKEN.EXPIRY
                );
    
                const DOMAIN = quicker.getDomainFromUrl(config.SERVER_URL);
                res.cookie('accessToken', accessToken, {
                    path: '/api/v1',
                    domain: DOMAIN,
                    sameSite: 'strict',
                    maxAge: 1000 * config.ACCESS_TOKEN.EXPIRY,
                    httpOnly: true,
                    secure: !(config.ENV === 'development'),
                });
    
                res.cookie('refreshToken', refreshToken, {
                    path: '/api/v1',
                    domain: DOMAIN,
                    sameSite: 'strict',
                    maxAge: 1000 * config.REFRESH_TOKEN.EXPIRY,
                    httpOnly: true,
                    secure: !(config.ENV === 'development'),
                });

                const refreshTokenPayload = {
                    token: refreshToken
                }
    
                await databaseService.createRefreshToken(refreshTokenPayload)
    
                return httpResponse(req, res, 200, responseMessage.SUCCESS, { accessToken, refreshToken });
            }
    
            const userData = { email };
            const newUser = await databaseService.createUser(userData);
    
            if (!newUser) {
                return httpError(next, responseMessage.INTERNAL_SERVER_ERROR, req, 500);
            }
    
            accessToken = quicker.generateToken(
                { userId: newUser.id },
                config.ACCESS_TOKEN.SECRET,
                config.ACCESS_TOKEN.EXPIRY
            );
    
            refreshToken = quicker.generateToken(
                { userId: newUser.id },
                config.REFRESH_TOKEN.SECRET,
                config.REFRESH_TOKEN.EXPIRY
            );
    
            const DOMAIN = quicker.getDomainFromUrl(config.SERVER_URL);
            res.cookie('accessToken', accessToken, {
                path: '/api/v1',
                domain: DOMAIN,
                sameSite: 'strict',
                maxAge: 1000 * config.ACCESS_TOKEN.EXPIRY,
                httpOnly: true,
                secure: !(config.ENV === 'development'),
            });
    
            res.cookie('refreshToken', refreshToken, {
                path: '/api/v1',
                domain: DOMAIN,
                sameSite: 'strict',
                maxAge: 1000 * config.REFRESH_TOKEN.EXPIRY,
                httpOnly: true,
                secure: !(config.ENV === 'development'),
            });
            
            const refreshTokenPayload = {
                token: refreshToken
            }
            await databaseService.createRefreshToken(refreshTokenPayload)
    
            return httpResponse(req, res, 201, responseMessage.SUCCESS, { accessToken, refreshToken });
            
        } catch (err) {
            return httpError(next, err, req, 500);
        }
    },
    selfIdentification: async (req, res, next) => {
        try {
            const user = req.authenticatedUser;
            if (!user) {
                return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 401);
            }
            
            httpResponse(req, res, 200, responseMessage.SUCCESS, user);
        } catch (err) {
            return httpError(next, err, req, 500);
        }
    },
    refreshToken: async (req, res, next) => {
        try {
            const { cookies } = req;
    
            const { refreshToken, accessToken } = cookies;
    
            if (accessToken) {
                return httpResponse(req, res, 200, responseMessage.SUCCESS, {
                    accessToken
                });
            }
    
            if (refreshToken) {
                // Fetch token from the database
                const rft = await databaseService.findRefreshToken(refreshToken);
                if (rft) {
                    const DOMAIN = quicker.getDomainFromUrl(config.SERVER_URL);
    
                    let userId = null;
    
                    try {
                        const decryptedJwt = quicker.verifyToken(refreshToken, config.REFRESH_TOKEN.SECRET);
                        userId = decryptedJwt.userId;
                    } catch (err) {
                        userId = null;
                    }
    
                    if (userId) {
                        // Generate new Access Token
                        const newAccessToken = quicker.generateToken(
                            { userId: userId },
                            config.ACCESS_TOKEN.SECRET,
                            config.ACCESS_TOKEN.EXPIRY
                        );
    
                        // Set the new Access Token in cookies
                        res.cookie('accessToken', newAccessToken, {
                            path: '/api/v1',
                            domain: DOMAIN,
                            sameSite: 'strict',
                            maxAge: 1000 * config.ACCESS_TOKEN.EXPIRY,
                            httpOnly: true,
                            secure: !(config.ENV === 'development')
                        });
    
                        return httpResponse(req, res, 200, responseMessage.SUCCESS, {
                            accessToken: newAccessToken
                        });
                    }
                }
            }
    
            httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 401);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },
    

};
