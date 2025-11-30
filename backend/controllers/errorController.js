const AppError = require('./../utils/AppError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Dulplicate Field Value : ${value}. Please use another value`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors);
  const values = errors.map((val) => val.message).join('. ');
  console.log('Error is ' + values);
  const message = `Invalid input data. ${values}`;
  return new AppError(message, 400);
};
// send Error Devolpement
const sendErrorDev = (err, req, res) => {
  // api error
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      Error: err,
      stack: err.stack,
    });
  }

  // Rendring webSite
  return res.status(err.statusCode).render('error', {
    title: 'Some Thing Went Wrong',
    message: err.message,
  });
};

// send Error Production
// Operational , trusted error: send message to client
const sendErrorProd = (err, req, res) => {
  //api error
  if (req.originalUrl.startsWith('/api')) {
    //isOperational
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // programming or other unknwon error: don't leak error details
    // 1) log Error for programers
    console.error('Error 💥 ' + '' + err);
    // 2) send generic message to client
    return res.status(500).json({
      status: 'error',
      message: 'something went wrong',
    });
  }
  //Rendring Website
  if (err.isOperational) {
    //Operantions Error Or trusted error
    return res.status(err.statusCode).render('error', {
      title: 'Some Thing Went Wrong',
      message: err.message,
    });
  }
  // Unkwnon error Or Programing Error
  return res.status(err.statusCode).render('error', {
    title: 'Some Thing Went Wrong',
    message: 'Pleasee Try Again Later!',
  });
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  // erro for development
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    // create a copy from err
    let error = Object.create(err);
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    sendErrorProd(error, req, res);
  }
};
