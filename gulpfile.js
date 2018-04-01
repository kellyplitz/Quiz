var gulp = require('gulp');

// ---------- PLUGINS ---------------
var sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    connect = require('gulp-connect'),
    rename = require('gulp-rename'),
    plumber = require('gulp-plumber'),
    browserSync = require('browser-sync'),
    cssmin = require('gulp-cssmin'),
    imagemin = require('gulp-imagemin'),
    babel = require('gulp-babel')

// ---------- STYLES ---------------
gulp.task('styles', function(){
    gulp.src(['src/assets/css/**/*.scss'])
        .pipe(plumber({
            errorHandler: function (error) {
                console.log(error.message);
                this.emit('end');
            }}))
        .pipe(sass())
        .pipe(gulp.dest('dist/assets/css/'))
        .pipe(rename({suffix: '.min'}))
        .pipe(cssmin())
        .pipe(gulp.dest('dist/assets/css/'))
        .pipe(browserSync.reload({stream: true}))

});

// ---------- SCRIPTS ---------------
gulp.task('scripts',function(){
    gulp.src(['src/assets/js/**/*.js'])
        .pipe(plumber({
            handleError: function (err) {
                console.log(err);
                this.emit('end');
            }
        })) 
        .pipe(babel())
        .pipe(concat('main.js'))
        .pipe(gulp.dest('dist/assets/js'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(uglify())
        .pipe(gulp.dest('dist/assets/js'))
        .pipe(browserSync.reload({stream: true}))
});

// ---------- IMAGES ---------------
gulp.task('images', function() {
    return gulp.src('src/assets/img/**/*')
        .pipe(plumber({
            handleError: function (err) {
                console.log(err);
                this.emit('end');
            }
        }))
        .pipe(imagemin())
        .pipe(gulp.dest('dist/assets/img'))
        .pipe(browserSync.reload({stream: true}))
});

// ---------- BROWSER-SYNC ---------------
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "dist"
        }
    });
});

// ---------- DEFAULT TASK ---------------
gulp.task('watch', ['browser-sync'], function(){
    gulp.watch('src/assets/js/**/*.js',['scripts']);
    gulp.watch('src/assets/css/**/*.scss',['styles']);
    gulp.watch('src/assets/img/**/*',['images']);

    gulp.watch("dist/**/*.html").on("change", browserSync.reload)
    gulp.watch("src/assets/css/**/*.scss").on("change", browserSync.reload) // protoze u styles nefunguje
});
