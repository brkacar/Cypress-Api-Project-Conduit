const { defineConfig } = require("cypress");

module.exports = defineConfig({

  env: {
    username: 'brkacaran@gmail.com',
    password: 'Test@1234',
    apiUrl: 'https://conduit-api.bondaracademy.com/api'

  },

  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'reporter-config.json',
  },

  e2e: {
    baseUrl: 'https://conduit.bondaracademy.com/',
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
      const { plugin: cypressGrepPlugin } = require('@cypress/grep/plugin')
      cypressGrepPlugin(config)

      config.env.username = process.env.USER_NAME,
        config.env.password = process.env.PASSWORD
      return config
    },
    retries: {
      runMode: 1,
      openMode: 0,
    },

  },
  viewportWidth: 1280,
  viewportHeight: 720
});
