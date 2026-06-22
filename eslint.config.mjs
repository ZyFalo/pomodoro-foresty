import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: ["src/generated/**", "coverage/**"],
  },
  {
    // eslint-plugin-react-hooks 7.x añade reglas del React Compiler muy estrictas.
    // Este proyecto usa patrones válidos de React 19 que ellas marcan como falsos
    // positivos: data-fetching client-side en effects (setState tras await) y
    // callbacks referenciados en effects. Se desactivan hasta adoptar una librería
    // de data-fetching (SWR/React Query) o el React Compiler. Se mantienen las
    // reglas clásicas (rules-of-hooks y exhaustive-deps).
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
    },
  },
];

export default eslintConfig;
