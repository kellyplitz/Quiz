# JavaScript Quiz

Dummy project for testing my skills in JavaScript

## Getting Started

These instructions will get you a copy of the project up and running on your local machine.

### Prerequisites

If you don't have Gulp installed, run those commands in the desired folder.

```
npm install gulp -g
npm install gulp --save-dev
```

Then, you will need bunch of Gulp modules.

```
npm install --save-dev gulp-sass
npm install --save-dev gulp-uglify
npm install --save-dev gulp-concat
npm install --save-dev gulp-connect
npm install --save-dev gulp-rename
npm install --save-dev gulp-plumber
npm install --save-dev gulp-browser-sync
npm install --save-dev gulp-cssmin
npm install --save-dev gulp-imagemin
npm install --save-dev gulp-babel
```

### Installing

The project also requires Babel to compilate ES6. Run those commands in the desired folder.

```
npm install babel-core
npm install babel-preset-es2015-without-strict
```

## Running the build

Default Gulp task for running the build:

```
gulp watch
```
