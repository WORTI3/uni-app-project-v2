import {ERROR_MESSAGES} from '../assets/constants';
import {validationResult} from 'express-validator';
import {type RequestHandler} from 'express';
import { User } from '../types';

/**
 * Middleware function that checks the validation result of a request and redirects to the original URL with error messages if there are any validation errors.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns redirect() if errors exist.
 */
export const checkValidationResult: RequestHandler = (req, res, next) => {
	const result = validationResult(req).array();
	const fieldErrors = [];

  // Extract the input values from the request body
  const inputValues = {
    username: req.body.username,
    password: req.body.password,
	}
	console.log(inputValues);

	for (const [key, value] of Object.entries(inputValues)) {
    fieldErrors.push({
      field: key,
      value: value,
      error: result.find(e => e.param === key)?.msg || null
    });
  }
	const session = req.session as any;
	// session.messages = messages;
	console.log(fieldErrors);
	session.errorFields = fieldErrors;

	const url = req.originalUrl;
	return res.redirect(url);
	
	if (result.length > 10) {
		console.log("error result: ", result);
		
		const messages = result.map((error: { msg: any; }) => error.msg);
		const session = req.session as any;
		session.messages = messages;
		console.log(messages);

		// const fieldErrors = result.map((error: { param: any, value: string; }) => {error.param, error.value });
		const fieldErrors = result.map(error => ({
      field: error.param,
      value: error.value ?? req.body[error.param]
    }));
		session.errorFields = fieldErrors;
		
		const url = req.originalUrl;
		// if (url.endsWith('/edit') || url.endsWith('/add')) {
		// 	req.session.asset = {
		// 		name: req.body.name,
		// 		code: req.body.code,
		// 		type: req.body.type,
		// 		note: req.body.note,
		// 	};
		// }

		return res.redirect(url);
	}

	next();
};

/**
 * Middleware function that checks if the user is authenticated and has admin privileges.
 * If the user is authenticated and has admin privileges, the next middleware function is called.
 * If not, an error message is added to the session and the user is redirected to the home page.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function to call.
 * @returns next() or redirect to route page.
 */
export const isAdmin: RequestHandler = (req, res, next) => {
  const user = req.user as User;
	if (req.isAuthenticated() && user.role === 1) {
		next();
	}

	const session = req.session as any;
	session.messages = [ERROR_MESSAGES.NO_PERMISSION];
	return res.redirect('/');
};
