module.exports = {
  roots: ["<rootDir>/src"],
  testEnvironment: "node",
  transform: {
    ".+\\.ts$": "ts-jest",
  },
  moduleNameMappper: {
    "@/(.*)": "<rootDir>/src/$1",
  },
};
