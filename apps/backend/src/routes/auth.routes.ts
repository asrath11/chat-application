import { Router } from 'express';
import { validate } from '../middleware/validate';
import { signupSchema, signinSchema } from '../schemas/auth.schema';
import { signup, signin } from '../controllers/auth.controller';

const router = Router();

router.post('/signup', validate(signupSchema), signup);
router.post('/signin', validate(signinSchema), signin);

export default router;
