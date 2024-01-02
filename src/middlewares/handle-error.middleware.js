const loggerErrorMiddleware = (err, req, res, next) => {
    console.log(`❌ Error is : ${err.message}`);
  
    next(err);
  };
  
  const errorResponseMiddleware = (err, req,res,next) => {
      const status = err.status || 500;
  
      return res.status(status).json({
          status,
          message: err.message
      })
  }
  
  module.exports = {
      loggerErrorMiddleware,
      errorResponseMiddleware,
  }