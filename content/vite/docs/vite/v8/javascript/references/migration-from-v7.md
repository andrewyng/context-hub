# Migration From Vite 7

Use this note when a project is upgrading from `vite@7.x` to `vite@8.0.0` and has custom build, optimization, or plugin behavior.

## High-Impact Changes

- The default production browser target moved forward to Baseline Widely Available as of `2026-01-01`: Chrome `111`, Edge `111`, Firefox `114`, Safari `16.4`.
- Vite 8 uses Rolldown and Oxc based tooling in place of the older Rollup and esbuild-based core pipeline.
- Dependency optimization now prefers `optimizeDeps.rolldownOptions`. `optimizeDeps.esbuildOptions` still works through a compatibility layer but is deprecated.
- The top-level `esbuild` option is also a compatibility layer now. Prefer `oxc`.
- JavaScript minification now uses Oxc Minifier by default.
- CSS minification now uses Lightning CSS by default.
- CommonJS default import interop is handled more consistently, so projects that rely on edge-case CJS behavior should test imports after upgrading.

## Plugin and Config Checks

- If your config or plugins call `transformWithEsbuild`, add `esbuild` as a `devDependency` for now and plan to migrate to `transformWithOxc`.
- If your project relied on `esbuild.minify*`, property mangling, or other esbuild-specific minifier behavior, review the Oxc minifier equivalents before upgrading.
- If you customize dependency optimization, migrate from `optimizeDeps.esbuildOptions` to `optimizeDeps.rolldownOptions`.
- For advanced bundler settings, prefer `build.rolldownOptions`.

## Decorators

The Oxc transformer does not currently lower native decorators. If your project needs decorator lowering, add an explicit Babel or SWC transform step and verify the decorator proposal version your stack requires.

## Suggested Upgrade Flow

1. Upgrade `vite` in `package.json`.
2. Confirm the project runs on Node.js `20.19+` or `22.12+`.
3. Replace deprecated esbuild-based optimizer or transform settings with Rolldown or Oxc equivalents.
4. Run a production build and smoke-test CommonJS-heavy areas, CSS output, and any custom plugin transforms.
