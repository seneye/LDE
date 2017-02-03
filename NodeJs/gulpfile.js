"use strict";

var gulp = require('gulp');
var ts = require('gulp-typescript');
var merge = require('merge2');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
var less = require('gulp-less');

var tsProject = ts.createProject('tsconfig.json');

gulp.task('build-debug', function() { 
    var tsResult = tsProject.src()
        .pipe(sourcemaps.init())   
    .pipe(tsProject());
    return merge([
        //Build typescript to dist folder 
        // tsResult.dts
        //     .pipe(gulp.dest('dist')),
        tsResult.js
            .pipe(sourcemaps.write("./", { sourceRoot: __dirname }))
    .pipe(gulp.dest('.'))]);
});


gulp.task('build-less', function() { 
 

    var lessResult = gulp.src('client/css/a.less')
        .pipe(less())
        .pipe(gulp.dest(function(f) {
            return f.base;
        }))

    return merge([
        lessResult.pipe(sourcemaps.write("./", { sourceRoot: __dirname }))
    .pipe(gulp.dest('.'))]);
});