import type { ModuleMeta } from "../module/types";
import { moduleSetupCtx } from "../module/internal";

export function appModuleSetupCtx(meta: ModuleMeta) {
  return {
    ...moduleSetupCtx(meta, true),
    // TODO APP SETUP...
  };
}
