import app from './app';
import {
	createServer
} from 'http';

const port: number | string | boolean = normalisePort(process.env.PORT ?? '4000');

app.set('port', port);

const server = createServer(app);

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */
function normalisePort(val: string): number | string | boolean {
	const port = parseInt(val, 10);

	if (isNaN(port)) {
		return val;
	}

	// Number
	if (port >= 0) {
		return port;
	}

	return false;
}

/**
 * Error event listener.
 */
function onError(error: NodeJS.ErrnoException): void {
	if (error.syscall !== 'listen') {
		throw error;
	}

	const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
	switch (error.code) {
		case 'EACCES':
			console.error(bind + ' requires elevated privileges');
			process.exit(1);
		// eslint-disable-next-line no-fallthrough
		case 'EADDRINUSE':
			console.error(bind + ' is already in use');
			process.exit(1);
		// eslint-disable-next-line no-fallthrough
		default:
			throw error;
	}
}

/**
 * Listener event listener.
 */
function onListening(): void {
	const address = server.address();
	const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + address?.port;
	console.log('App Listening on ' + bind);
}

export default server;
