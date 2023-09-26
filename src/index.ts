import App from './core/app';

async function startApp() {
  try {
    // Local development only
    if(process.env.NODE_ENV === "local") (await import("dotenv")).config()

    const app = new App(process.env.PORT as string);

    app.initConfig()
    app.build()
    app.listen()
  } catch (error) {
    console.log("App initialization failed!", error);
  }
}

startApp()