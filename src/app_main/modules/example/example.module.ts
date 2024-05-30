import { createExampleHono } from './example.hono';
import { ExampleService } from './example.service';

const exampleService = new ExampleService(); // internal module
export const exampleHono = createExampleHono(exampleService);
