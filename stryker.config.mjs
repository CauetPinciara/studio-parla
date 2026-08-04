/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  mutate: ["src/features/fechamento/domain.ts", "src/features/pecas/domain.ts", "src/features/visao-geral/domain.ts"],
  testRunner: "vitest",
  reporters: ["clear-text", "progress"],
  concurrency: 2,
  allowConsoleColors: false,
};
