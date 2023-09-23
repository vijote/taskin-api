import 'reflect-metadata'
import { Container } from 'inversify';
import { InversifyExpressServer, cleanUpMetadata } from 'inversify-express-utils';
import supertest from 'supertest';
import AppController from './app.controller';

describe('AppController', () => {
  let container: Container;
  let server: InversifyExpressServer;
  let app: Express.Application;
  let agent: supertest.SuperTest<supertest.Test>;

  beforeEach(() => {
    cleanUpMetadata();
    
    // Create a new Inversify container
    container = new Container();

    // Configure the InversifyExpressServer
    server = new InversifyExpressServer(container);

    // Bind the AppController to the container
    container.bind(AppController).toSelf();

    // Build the Express app
    app = server.build();

    // Create a SuperTest agent for testing
    agent = supertest(app);
  });

  it('should return "Welcome to Taskin API" when index is called', async () => {
    // Perform a GET request to the root path '/'
    const response = await agent.get('/');

    // Check if the response status is 200
    expect(response.status).toBe(200);

    // Check if the response body contains the expected text
    expect(response.text).toContain('Welcome to Taskin API');
  });
});
