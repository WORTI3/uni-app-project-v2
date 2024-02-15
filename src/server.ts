import app from './app';

const port: number | string | boolean = normalisePort(process.env.PORT ?? '4000');

export const initServer = () => {
  const server = app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });

  // Add error handling for the 'listening' event
  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use`);
    } else {
      console.error(err);
    }
    process.exit(1); // Exit the process with a failure status code
  });
};

export const server = initServer();

/**
 * Normalize a port into a number, string, or false.
 */
export function normalisePort(val: string): number | string | boolean {
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
