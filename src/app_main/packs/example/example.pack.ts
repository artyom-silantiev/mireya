import { HonoPack, type HonoContext } from '!src/lib_share/packs/hono.pack';

@HonoPack.Controller()
class ExampleController {
  @HonoPack.Get('/hello')
  @HonoPack.Middleware(async (c, next) => {
    console.log('Hello before middleware!');
    await next();
    console.log('Hello after middleware!');
  })
  async hello(c: HonoContext) {
    return c.text('Hello, from example controller!');
  }
}

export const ExamplePack = {
  honoRouter: HonoPack.generateHonoFromController(new ExampleController()),
};
