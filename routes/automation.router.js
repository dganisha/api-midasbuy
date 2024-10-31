module.exports = app => {
  const automationController = require('../controller/automation.controller')
  const router = require('express').Router()

  router.post('/start', automationController.startAutomation)

  app.use('/api/automation', router)
}