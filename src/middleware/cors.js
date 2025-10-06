const origin = process.env.CORS_ORIGIN?.split(',').map(s=>s.trim()) || ['http://localhost:8080','http://localhost:3000'];
export default { origin, credentials: false };
