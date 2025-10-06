import { RateLimiterMemory } from 'rate-limiter-flexible';

const limiter = new RateLimiterMemory({ points: 200, duration: 60 }); // 200 req/min per IP

export default (req,res,next)=>{
  limiter.consume(req.ip).then(()=> next())
    .catch(()=> res.status(429).json({error:'Too many requests'}));
};
