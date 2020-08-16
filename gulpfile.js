var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var tsify = require('tsify');

gulp.task('default', function () {
    return browserify({
        basedir: '.',
        debug: true,
        entries: ['src/shogui.ts'],
        standalone: 'ShoGUI',
        cache: {},
        packageCache: {}
    })
    .plugin(tsify)
    .bundle()
    .pipe(source('shogui.js'))
    .pipe(gulp.dest('dist'));
});