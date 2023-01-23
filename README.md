# Elm Falcon UI

__This readme is outdated!__

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.2.0.

## Getting Started
This section should only need to be followed just after your first time cloning.

### Installing the Angular CLI
- Configure npm to use the Cardinal [Man-In-The-Middle](https://en.wikipedia.org/wiki/Man-in-the-middle_attack) Root CA cert
    - `npm config -g set cafile ./CAH-Root-CA-PR1.pem`
- Run `npm install -g @angular/cli` in the terminal of your choice to install the Angular CLI

### Set Up Git Hooks
```
After cloning the repo locally, run the cah-repo-init to initialize the git validations (hooks):

 *  Window: run the cah-repo-init.bat 

 *  Linux/Mac : run the cah-repo-init.sh 

Remove Everything above this line after the initialization
```

## Development server
Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build
Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests
- Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).
  - add `--code-coverage` then open `coverage/Chrome Headless.../index.html` in a browser to view results.

## Running end-to-end tests
Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
