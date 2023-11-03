/// <reference types='bun-types' />
import { existsSync, rmSync } from 'fs';

// Generating types
const root = import.meta.dir, dir = root + '/types';

if (existsSync(dir))
    rmSync(dir, { recursive: true });

Bun.build({
    format: 'esm',
    target: 'bun',
    outdir: '.',
    minify: true,
    entrypoints: [root + '/src/index.ts', root + '/src/turbo.ts']
});

// Build type declarations
Bun.spawn(['bun', 'x', 'tsc', '--outdir', dir], { stdout: 'inherit' });
