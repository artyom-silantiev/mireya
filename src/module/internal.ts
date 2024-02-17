import 'reflect-metadata/lite';
import type {
  InjectableIdentifier,
  InjectableItemMeta,
} from '../internal/types';
import { Metadata } from '../lib';
import {
  type ModuleMeta,
  type LifecycleHandler,
  LifecycleHandlerType,
} from './types';

export const injectableItems = new Metadata<
  InjectableIdentifier,
  InjectableItemMeta
>();
export const injectedServices = new Metadata<InjectableIdentifier, any>();
export const modulesMeta = new Metadata<any, ModuleMeta>();
export const appModules = [] as Module[];
let modulesCount = 0;

export class Module {
  constructor() {
    const moduleMeta = {
      id: modulesCount++,
      module: this,
      lifecycleHandlers: {},
    } as ModuleMeta;
    modulesMeta.set(this, moduleMeta);
    appModules.push(this);
  }

  private meta() {
    return modulesMeta.get(this) as ModuleMeta;
  }

  useModule(module: Module) {}
  useModules(...modules: Module[]) {}

  get(id: InjectableIdentifier) {
    const instanse = injectedServices.get(id);
    if (instanse) {
      return instanse;
    }

    const paramsTypes = Reflect.getMetadata('design:paramtypes', id);
    console.log('111', id, paramsTypes);
    if (paramsTypes && Array.isArray(paramsTypes)) {
      const paramsInstanses = [] as any[];
      paramsTypes.forEach((id) => {
        const depInstanse = this.get(id);
        paramsInstanses.push(depInstanse);
      });
      const newInstanse = Reflect.construct(id, paramsInstanses);
      injectedServices.set(id, newInstanse);
      return newInstanse;
    } else {
      const newInstanse = Reflect.construct(id, []);
      injectedServices.set(id, newInstanse);
      return newInstanse;
    }
  }

  onModuleInit(handler: LifecycleHandler) {
    const meta = this.meta();

    if (!meta.lifecycleHandlers[LifecycleHandlerType.init]) {
      meta.lifecycleHandlers[LifecycleHandlerType.init] = [];
    }
    meta.lifecycleHandlers[LifecycleHandlerType.init].push(handler);
  }

  onModuleDestroy(handler: LifecycleHandler) {
    const meta = this.meta();

    if (!meta.lifecycleHandlers[LifecycleHandlerType.destroy]) {
      meta.lifecycleHandlers[LifecycleHandlerType.destroy] = [];
    }
    meta.lifecycleHandlers[LifecycleHandlerType.destroy].push(handler);
  }
}
