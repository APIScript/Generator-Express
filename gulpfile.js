
var del = require('del');
var gulp = require('gulp');
var sequence = require('gulp-sequence');
var json = require('gulp-json-editor');
var typescript = require('gulp-typescript');

gulp.task('clean:build', function() {
    return del(['build/**/*']);
});

gulp.task('clean:package', function() {
    return del(['package/**/*']);
});

gulp.task('build', ['clean:build'], function() {

    var config = typescript.createProject('tsconfig.json');

    return gulp.src('src/main/**/*.ts')
        .pipe(config())
        .pipe(gulp.dest('build/main'));
});

gulp.task('package:package.json', function() {

    gulp.src('package.json')
        .pipe(json({ 'main': 'index.js' }))
        .pipe(gulp.dest('package'));
});

gulp.task('package:license', function() {

    return gulp.src('./LICENSE')
        .pipe(gulp.dest('package'));
});

gulp.task('package:injects', function() {

    return gulp.src('src/inject/**/*')
        .pipe(gulp.dest('package/inject'));
});

gulp.task('package:src', function() {

    return gulp.src('build/main/**/*')
        .pipe(gulp.dest('package'));
});

gulp.task('clean', ['clean:build', 'clean:package']);

gulp.task('package', sequence('clean:package', 'build', 'package:src',
          'package:license', 'package:package.json', 'package:injects'));