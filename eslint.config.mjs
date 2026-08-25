import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // React Compiler's purity/immutability rules assume idempotent render
    // and immutable hook return values. Imperative Three.js/R3F code
    // (mutating scene-graph objects inside useFrame, one-time randomized
    // layout via useMemo) is the correct, standard pattern for this
    // ecosystem and is incompatible with those rules by design.
    files: ["src/components/three/**/*.{ts,tsx}"],
    rules: {
      "react-hooks/purity": "off",
      "react-hooks/immutability": "off",
    },
  },
]);

export default eslintConfig;
