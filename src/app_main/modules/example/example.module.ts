import { createExampleHono } from './example.hono';
import { ExampleService } from './example.service';

const exampleService = new ExampleService(); // internal service
export const exampleHono = createExampleHono(exampleService);
