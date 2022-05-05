import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import del from "rollup-plugin-delete";

export default [
  {
    input: "src/index.ts",
    output: { dir: "dist", format: "es" },
    plugins: [typescript()],
    external: ["qieyun", "yitizi"],
  },
  {
    input: "./dist/index.d.ts",
    output: { file: "dist/index.d.ts", format: "es" },
    plugins: [dts(), del({ targets: ["dist/*.d.ts", "!dist/index.d.ts"], hook: "buildEnd" })],
  },
];
