import App from './core/app';

async function startApp() {
  try {
    const app = new App(process.env.PORT as string);

    app.initConfig()
    app.build()
    app.listen()
  } catch (error) {
    console.log("App initialization failed!", error);
  }
}

startApp()