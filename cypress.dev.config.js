const { defineConfig } = require("cypress");

module.exports = defineConfig({

  env: {
    username: 'brkacarandev@gmail.com',
    password: 'TestDev@1234',
    apiUrl: 'https://conduit-api.bondaracademy.com/api'
  
  },
  
  e2e: {
    baseUrl: 'https://conduit.bondaracademy.com/',
    setupNodeEvents(on, config) {
      config.env.username = process.env.USER_NAME,
      config.env.password = process.env.PASSWORD
      return config
    }
  },
  viewportWidth: 1280,
  viewportHeight: 720
});
