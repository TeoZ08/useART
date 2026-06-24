import { spawnSync } from 'node:child_process';

const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const result = spawnSync(command, ['vitest', 'run', 'tests/domain/media-audit.test.ts'], {
  cwd: process.cwd(),
  env: { ...process.env, AUDIT_BUILD_OUTPUT: '1' },
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
