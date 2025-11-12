import { Router } from 'express';
import { validate } from '../middleware/validate';
import { signupSchema, signinSchema } from '../schemas/auth.schema';
import { signup, signin, signout, getMe } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.post('/signup', validate(signupSchema), signup);
router.post('/signin', validate(signinSchema), signin);
router.post('/signout', signout);
router.get('/me', protect, getMe);

export default router;
