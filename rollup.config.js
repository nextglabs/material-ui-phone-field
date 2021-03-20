import typescript from "rollup-plugin-typescript2";
import strip from "@rollup/plugin-strip";

import pkg from "./package.json";

export default [
	{
		input: "src/index.ts",
		output: [
			{ file: pkg.main, format: "cjs" },
			{ file: pkg.module, format: "esm" },
		],
		plugins: [strip(), typescript({ tsconfig: "tsconfig.json" })],
		external: Object.keys(pkg.peerDependencies || {}),
	},
];
