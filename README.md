# Mireya

## Description

Mireya - backend app template

## Install

To install dependencies:

```sh
bun install
```

## Create DB for dev

```sh
bun prisma migrate dev
```

## Run for dev

```sh
bun dev
```

## Tests

```sh
bun tests
```

## Production

```sh
bun build.ts
bun dist/index.js
```

## Single app structure

- src/entry.ts - app entry point
- scr/lib - app some libs
- src/packs - app pack format libs

## Multiple apps structure:

- scr/lib - share some libs
- src/packs - share pack format libs

- src/app_one/entry.ts - app one entry point
- src/app_one/lib - app one some libs
- src/app_one/packs - app one pack format libs

- src/app_two/entry.ts - app two entry point
- src/app_two/lib - app two some libs
- src/app_two/packs - app two paco format libs
