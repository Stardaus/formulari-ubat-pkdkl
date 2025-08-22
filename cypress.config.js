import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    specPattern: "tests/ui/**/*.cy.js",
    baseUrl: "http://localhost:4000", // Default Jekyll local server port
    supportFile: false, // Disable support file as it's not needed for this project
  },
});