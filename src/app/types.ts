import type { appModuleSetupCtx } from './internal';

export type AppModuleSetupCtx = ReturnType<typeof appModuleSetupCtx>;
export type AppModuleSetup<T> = (ctx: AppModuleSetupCtx) => T;
