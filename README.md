# Taskin API: Express + TypeScript app

- Esta app fue desarrollada usando Express 4 y Typescript 5.
- Por favor también descargue la [app frontend](https://github.com/vijote/taskin/) para tener el entorno completo.



## Instalación local

- La aplicación fue desarrollada usando Node `20.7.0`, por favor utilice esta versión.
- Se usó la última versión de mysql (dockerizada sin tag).
- Comience creando el container docker para la base de datos:
```
    docker run --name taskin-db -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root -d mysql
```
- Luego cree un archivo .env:
```
   # Url de la base de datos (usando docker)
   DATABASE_URL='mysql://root:root@localhost:3306/taskin?useSSL=false'

   # Puerto a usar en desarrollo
   PORT=8000

   # Variables claves de encriptación
   ENCRYPTION_KEY="12345678901234561238971203987120938710298371092837"
   ENCRYPTION_IV="1234567890123456"
   ENCRYPTION_ALGORITHM="aes-256-cbc"
   FRONTEND_URL="http://localhost:5173"
```

- Instale las dependencias del proyecto:
```
    yarn install
```

- Prosiga migrando la base de datos:
```
    yarn prisma migrate dev
```

- Para ejecutar la app en modo desarrollo:
```
    yarn dev
```

## Deploy en la nube
Puede visitar esta app en el [deploy en Netlify](https://amazing-hamster-e1e505.netlify.app/)
- La api tambien se encuentra [deployada en Render](https://taskin.onrender.com/) (Puede demorar unos minutos en despertar el servicio)

## Ejecución en local
Para usar la app en modo desarrollo puede ejecutar:
- Para instalar dependencias:
```
   yarn install
```

- Para ejecutar en modo desarrollo:
```
   yarn dev
```