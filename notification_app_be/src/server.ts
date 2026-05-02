import app from './app';

const basePort = process.env.PORT ? Number(process.env.PORT) : 3000;

function startServer(port: number) {
  const server = app.listen(port, () => {
    console.log(`notification-app-be running on http://localhost:${port}`);
  });

  server.on('error', (err: any) => {
    if (err && err.code === 'EADDRINUSE') {
      const nextPort = port + 1;
      console.warn(`Port ${port} is already in use. Trying port ${nextPort} instead...`);
      startServer(nextPort);
    } else if (err instanceof Error) {
      console.error('Server failed to start:', err.message);
      process.exit(1);
    } else {
      console.error('Server failed to start:', err);
      process.exit(1);
    }
  });
}

startServer(basePort);
