import { Router } from 'express'
import apiController from '../controller/apiController.js'
import authencation from '../middleware/authentication.js'
import rateLimit from '../middleware/rateLimit.js'
const router = Router()

router.route('/self').get(apiController.self)
router.route('/health').get(apiController.health)
router.route('/verify-email').post(authencation,apiController.verifyEmailAddress)
router.route('/login').post(apiController.login)
router.route('/self-identification').get(authencation,apiController.selfIdentification)
router.route('/refresh-token').post(rateLimit,authencation,apiController.refreshToken)

export default router