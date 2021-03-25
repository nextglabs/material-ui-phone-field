import typescript from "rollup-plugin-typescript2";
import strip from "@rollup/plugin-strip";
import sass from "rollup-plugin-sass";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

import pkg from "./package.json";

export default [
	{
		input: "src/index.ts",
		output: [
			{ file: pkg.main, format: "cjs" },
			{ file: pkg.module, format: "esm" },
		],
		plugins: [
			nodeResolve(),
			commonjs({
				include: ["node_modules/**"],
			}),
			sass(),
			strip(),
			typescript({ tsconfig: "tsconfig.json" }),
		],

		external: Object.keys(pkg.peerDependencies || {}),
	},
];
