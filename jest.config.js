export default {
  testEnvironment: "jsdom",
  setupFiles: ["./tests/setup.js"],
  testPathIgnorePatterns: ["<rootDir>/_site/"],
  modulePathIgnorePatterns: ["<rootDir>/_site/"],
  transform: {
    "^.+\.js$": "babel-jest",
  },
};
