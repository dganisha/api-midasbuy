exports.success = (message, data, statusCode) => {
  return {
    errorCode: statusCode,
    errorMessage: message,
    data: data
  }
}
