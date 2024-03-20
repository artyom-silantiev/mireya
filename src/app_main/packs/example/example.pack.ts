import { HonoPack } from '!src/lib_share/packs/hono.pack';
import type { Context } from 'hono';

@HonoPack.Controller()
@HonoPack.Middleware(async (c, next) => {
  console.log('Hello before middleware! 1');
  await next();
  console.log('Hello after middleware! 1');
})
@HonoPack.Middleware(async (c, next) => {
  console.log('Hello before middleware! 2');
  await next();
  console.log('Hello after middleware! 2');
})
class ExampleController {
  @HonoPack.Get('/hello')
  @HonoPack.Middleware(async (c, next) => {
    console.log('Hello before middleware! 3');
    await next();
    console.log('Hello after middleware! 3');
  })
  @HonoPack.Middleware(async (c, next) => {
    console.log('Hello before middleware! 4');
    await next();
    console.log('Hello after middleware! 4');
  })
  async hello(c: Context) {
    return c.text('Hello, from example controller!');
  }

  @HonoPack.On(['GET'], ['/ping'])
  async ping(c: Context) {
    return c.text('Pong!');
  }
}

export const ExamplePack = {
  honoRouter: HonoPack.generateHonoFromController(new ExampleController()),
};
