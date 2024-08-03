type LifecycleHandler = () => Promise<void> | void;
const onAppInitHandlers = [] as LifecycleHandler[];
const onAppDestroyHandlers = [] as LifecycleHandler[];

async function exitHandler(evtOrExitCodeOrError: number | string | Error) {
  for (const handler of onAppDestroyHandlers) {
    try {
      await handler();
    } catch (e) {
      console.error('APP DESTROY HANDLER ERROR', e);
    }
  }

  if (
    evtOrExitCodeOrError instanceof Error ||
    typeof evtOrExitCodeOrError === 'string'
  ) {
    console.error(evtOrExitCodeOrError);
  }

  process.exit(isNaN(+evtOrExitCodeOrError) ? 1 : +evtOrExitCodeOrError);
}

function listenExit() {
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

export async function onAppInit(handler: LifecycleHandler) {
  onAppInitHandlers.push(handler);
}

export async function onAppDestroy(handler: LifecycleHandler) {
  onAppDestroyHandlers.push(handler);
}

let applicationIsRun = false;
export async function applicationRun() {
  if (applicationIsRun) {
    throw new Error('The application is already running');
  }
  applicationIsRun = true;

  listenExit();

  for (const handler of onAppInitHandlers) {
    try {
      await handler();
    } catch (e) {
      console.error('APP INIT HANDLER ERROR', e);
    }
  }
}
