# Hierarchy Dashboard

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.0.3. Hierarchy Dashboard uses [Electron](https://www.electronjs.org/) to allow the Angular app to run as a desktop app. The entry point of the application in desktop mode is 'frontend/electron/app.js'.

## Setting up a local environment

To run the frontend code you need to install Angular. Follow the [guide](https://angular.io/guide/setup-local) to set things up locally.

## Install dependencies

Run `npm install` to install the project dependencies.

## Running the project in the browser

First, check the 'frontend/src/app/hierarchy.service.ts'. The 'root' is typically defaulted as 'http://localhost:5000'. The browser must use a proxy, so instead define root to be 'http://localhost:4200/api'. Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Running the project in electron desktop mode

The electron entry point expects a packaged backend executable when running in desktop mode. First, [install pyinstaller](https://pyinstaller.org/en/stable/installation.html) so that the backend can be packaged. Then run `npm run make-backend` to create the executable. Check the 'frontend/src/app/hierarchy.service.ts' and make sure 'root' is 'http://localhost:5000'. Finally, run `npm run start-desktop` to start up desktop mode. Desktop mode does not allow automatically reloading.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Making the electron desktop app

`npm run make` will package the electron app for whatever OS is currently being used. Making the app locally may cause it to be larger than expected. Instead, check [releases](https://github.com/lukemoore495/HierarchyDashboard/releases) for the latest cross-platform builds.