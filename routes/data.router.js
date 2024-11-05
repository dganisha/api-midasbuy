module.exports = app => {
  const dataController = require('../controller/data.controller')
  const router = require('express').Router()

  router.get('/product', dataController.getProducts)
  router.post('/payment', dataController.getPayment)

  app.use('/api/data', router)
}