var gulp = require('gulp');
var gutil = require('gulp-util');
var PROD = gutil.env.prod;
// Servers
var webserver = require('gulp-webserver');
var livereload = require('gulp-livereload');
var stylus = require('gulp-stylus');
var autoprefixer = require('gulp-autoprefixer');
var csso = require('gulp-csso');
var sourcemaps = require('gulp-sourcemaps');
// Errors and notifications
var plumber = require('gulp-plumber');
var notify = require("gulp-notify");
// Killer feature(as it's author says - save lifespan of your ssd:))
var GulpMem = require('gulp-mem');
var gulpMem = new GulpMem();
gulpMem.serveBasePath = './public';

gulp.task('build:css', function() {
  return gulp.src('./src/injected.styl')
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(PROD ? gutil.noop() : sourcemaps.init())
    .pipe(stylus())
    .pipe(PROD ? autoprefixer({
      browsers: '>0%'
    }) : gutil.noop())
    .pipe(csso({
      forceMediaMerge: true
    }))
    .pipe(PROD ? gutil.noop() : sourcemaps.write('.'))
    .pipe(PROD ? gulp.dest('./public') : gulpMem.dest('./public'))
    .on('end', function() {
      livereload();
    })
});

gulp.task('server', gulp.series('build:css', function(done) {
  gulp.src('./public')
    .pipe(webserver({
      middleware: gulpMem.middleware
    }));
  livereload.listen();
  done();
}));

gulp.task('watch', function(done) {
  gulp.watch('./src/**/*.styl', gulp.series('build:css'));
  done();
});

gulp.task('default', gulp.parallel('server', 'watch'));