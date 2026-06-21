const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Modern API Server listening on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/status`);
});