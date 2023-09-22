import dotenv from 'dotenv';
import App from './app/app';

async function startApp() {
  try {
    const env = dotenv.config().parsed

    const app = new App(env);

    app.initConfig()
    app.build()
    app.listen()
  } catch (error) {
    console.log("App initialization failed!", error);
  }
}

startApp()