export function validate(schema){
  return (req,res,next)=>{
    const target = ['POST','PUT','PATCH'].includes(req.method) ? req.body : req.query;
    const { error, value } = schema.validate(target, { abortEarly:false, stripUnknown:true });
    if(error){
      return res.status(400).json({ error: 'Validation failed', details: error.details.map(d=>d.message) });
    }
    if(['POST','PUT','PATCH'].includes(req.method)) req.body = value; else req.query = value;
    next();
  };
}
