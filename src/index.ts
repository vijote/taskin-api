import dotenv from 'dotenv';
import App from './app/app';

async function startApp() {
  try {
    dotenv.config()

    const app = new App(process.env);

    app.initConfig()
    app.build()
    app.listen()
  } catch (error) {
    console.log("App initialization failed!", error);
  }
}

startApp()