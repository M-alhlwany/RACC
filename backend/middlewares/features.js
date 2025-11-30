exports.getTimeString = (req, res, next) => {
  console.log('getTime');
  console.log('requestTime: ', (req.requestTime = new Date().toISOString()));
  next();
};
