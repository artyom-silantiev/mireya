import { LifecycleHandlerType } from '../module/types';
import { appModules, modulesMeta } from '../module/internal';

async function beforeExit() {
  for (const module of appModules) {
    const moduleMeta = modulesMeta.get(module);

    for (const moduleItem of moduleMeta.items) {
      if (
        typeof moduleItem === 'object' &&
        typeof moduleItem.onModuleDestroy === 'function'
      ) {
        await moduleItem.onModuleDestroy();
      }
    }
  }

  for (const module of appModules) {
    const moduleMeta = modulesMeta.get(module);

    for (const lifecycleHandler of moduleMeta.lifecycleHandlers[
      LifecycleHandlerType.destroy
    ]) {
      await lifecycleHandler();
    }
  }
}

async function exitHandler(evtOrExitCodeOrError: number | string | Error) {
  try {
    await beforeExit();
  } catch (e) {
    console.error('EXIT HANDLER ERROR', e);
  }

  if (
    evtOrExitCodeOrError instanceof Error ||
    typeof evtOrExitCodeOrError === 'string'
  ) {
    console.error(evtOrExitCodeOrError);
  }

  process.exit(isNaN(+evtOrExitCodeOrError) ? 1 : +evtOrExitCodeOrError);
}

export function listenExit() {
  [
    'beforeExit',
    'uncaughtException',
    'unhandledRejection',
    'SIGHUP',
    'SIGINT',
    'SIGQUIT',
    'SIGILL',
    'SIGTRAP',
    'SIGABRT',
    'SIGBUS',
    'SIGFPE',
    'SIGUSR1',
    'SIGSEGV',
    'SIGUSR2',
    'SIGTERM',
  ].forEach((evt) => process.on(evt, exitHandler));
}
