import dotenv from 'dotenv';
import App from './core/app';

async function startApp() {
  try {
    dotenv.config()

    const app = new App(process.env.PORT);

    app.initConfig()
    app.build()
    app.listen()
  } catch (error) {
    console.log("App initialization failed!", error);
  }
}

startApp()