# handoff: migrate use.apikeys to keyrack.source

## .what

replace legacy `use.apikeys.sh` pattern with `keyrack.source()` for test credential injection.

## .why

| before | after |
|--------|-------|
| manual `source .agent/.../use.apikeys.sh` | auto-inject via keyrack.source() |
| error: "run source command" | error: "rhx keyrack set --key X" |
| per-terminal auth | once per session (daemon) |

## .steps

### 1. upgrade rhachet to >=1.39.1

```sh
rhx set.package.upgrade --package rhachet --to @latest
```

### 2. declare keys in .agent/keyrack.yml

```yaml
# .agent/keyrack.yml
org: ehmpathy
extends:
  - .agent/repo=ehmpathy/role=mechanic/keyrack.yml
env.prod: null
env.prep: null
env.test:
  - YOUR_API_KEY
  - ANOTHER_KEY
```

### 3. update jest.integration.env.ts

```typescript
import { existsSync } from 'fs';
import { join } from 'path';

import { keyrack } from 'rhachet/keyrack';

// ... other checks ...

/**
 * .what = source credentials from keyrack for test env
 * .why = auto-inject keys into process.env, fail fast if missing
 */
const keyrackYmlPath = join(process.cwd(), '.agent/keyrack.yml');
if (existsSync(keyrackYmlPath)) {
  keyrack.source({
    env: 'test',
    owner: 'ehmpath',
    mode: 'strict',
  });
}
```

### 4. update jest.acceptance.env.ts

same pattern as integration.

### 5. remove test:auth from package.json

```diff
- "test:auth": "... source .agent/.../use.apikeys.sh ...",
- "test": "... eval $(ECHO=true npm run --silent test:auth) && ...",
+ "test": "... npm run test:commits && ...",
```

### 6. delete legacy files

```sh
rhx rmsafe --path '.agent/repo=.this/role=any/skills/use.apikeys.sh'
rhx rmsafe --path '.agent/repo=.this/role=any/skills/use.apikeys.json'
```

## .developer workflow after migration

```sh
# first time: unlock keyrack
rhx keyrack unlock --env test --owner ehmpath

# if key not set:
rhx keyrack set --key YOUR_API_KEY --env test

# run tests (keys auto-injected)
npm run test:integration
```

## .ci workflow

ci uses env vars directly — keyrack.source checks process.env first:

```yaml
# .github/workflows/.test.yml
env:
  YOUR_API_KEY: ${{ secrets.your-api-key }}
```

## .files changed

| file | action |
|------|--------|
| .agent/keyrack.yml | add keys under env.test |
| jest.integration.env.ts | replace apikeys check with keyrack.source() |
| jest.acceptance.env.ts | replace apikeys check with keyrack.source() |
| package.json | remove test:auth, upgrade rhachet |
| .agent/.../use.apikeys.sh | delete |
| .agent/.../use.apikeys.json | delete |
