var gulp = require('gulp');

var clean = require('gulp-clean');
var convert = require('gulp-convert');
var jshint = require('gulp-jshint');
var runSequence = require('run-sequence');
var zip = require('gulp-zip');

gulp.task('compile-manifest', function() {
    return gulp.src(['assets/chrome/manifest.yml'])
        .pipe(convert({ from: 'yml', to: 'json' }))
        .pipe(gulp.dest('target/'));
});

gulp.task('copy-javascript', function() {
    return gulp.src('assets/javascript/**')
        .pipe(gulp.dest('target/javascript/'));
});

gulp.task('copy-html', function() {
    return gulp.src('assets/html/**')
        .pipe(gulp.dest('target/html/'));
});

gulp.task('copy-sound', function() {
    return gulp.src('assets/sound/**')
        .pipe(gulp.dest('target/sound/'));
});

gulp.task('copy-css', function() {
    return gulp.src('assets/css/**')
        .pipe(gulp.dest('target/css/'));
});

gulp.task('copy-fonts', function() {
    return gulp.src('assets/fonts/**')
        .pipe(gulp.dest('target/fonts/'));
});

gulp.task('copy-third-party', function() {
    return gulp.src('assets/third-party/**')
        .pipe(gulp.dest('target/third-party/'));
});

gulp.task('copy-all', [ 'copy-css', 'copy-fonts', 'copy-javascript', 'copy-sound', 'copy-html', 'copy-third-party' ]);

gulp.task('clean-target', function() {
    return gulp.src('target', { read: false })
        .pipe(clean());
});

gulp.task('watch', function() {
    gulp.watch('assets/**/*', ['build']);
});

gulp.task('build', function(cb) {
    runSequence (
        'clean-target',
        [ 'compile-manifest', 'copy-all' ],
        'assemble',

        cb
    );
});

gulp.task('assemble', function () {
    return gulp.src('target/**')
        .pipe(zip('dash-point.zip'))
        .pipe(gulp.dest('dist'));
});


// Code quality

gulp.task('lint', function() {
    gulp.src('assets/javascript/src/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});
