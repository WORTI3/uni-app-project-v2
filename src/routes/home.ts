import { Request, Response, Router } from 'express';
/**
 * Creates a new instance of an Express router.
 * @returns {Router} - An instance of an Express router.
 */
export const homeRouter = Router();

/**
 * Handles GET requests to the root route.
 * If the user is not logged in, renders the home page.
 * If the user is logged in, renders the index page with the user object.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
homeRouter.get('/', (req: Request, res: Response) => {
  // Route handler
  if (!req.user) {
    // Check if user is authenticated
    return res.render('home'); // Render home page
  }

  res.redirect('/dashboard'); // Redirect to dashboard
});
