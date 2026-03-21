import { setupServer } from "msw/node";
import type { HttpHandler } from "msw";

export const createMockServer = (handlers: HttpHandler[]) => {
  const server = setupServer(...handlers);

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  return server;
};
