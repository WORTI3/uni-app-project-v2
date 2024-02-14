import { Router } from 'express';
/**
 * Creates a new instance of an Express router.
 * @returns {Router} - An instance of an Express router.
 */
const router = Router();

/**
 * Handles GET requests to the root route.
 * If the user is not logged in, renders the home page.
 * If the user is logged in, renders the index page with the user object.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
router.get('/', (req, res) => {
	if (!req.user) {
		return res.render('home');
	}

	res.redirect('/dashboard');
});

export default router;