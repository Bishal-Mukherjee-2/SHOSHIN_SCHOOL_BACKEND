function myBeforeRequestHandler(requestParams, context, ee, next) {
  requestParams.cookieJar = undefined;
  return next();
}

module.exports = { myBeforeRequestHandler };
