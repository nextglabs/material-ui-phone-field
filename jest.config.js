module.exports = {
	roots: ["<rootDir>/src"],
	clearMocks: true,
	collectCoverage: true,
	testMatch: ["**/__tests__/**/*.+(ts|tsx|js)", "**/?(*.)+(spec|test).+(ts|tsx|js)"],
	transform: {
		"^.+\\.(ts|tsx)$": "ts-jest",
	},
	setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
};
