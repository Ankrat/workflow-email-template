// Load plugins
var gulp    = require('gulp'),
browserSync = require('browser-sync'),
sass        = require('gulp-sass'),
sourcemaps  = require('gulp-sourcemaps'),
minifycss   = require('gulp-minify-css'),
minifyHTML  = require('gulp-minify-html'),
uglify      = require('gulp-uglify'),
cache       = require('gulp-cache'),
imagemin    = require('gulp-imagemin'),
rename      = require('gulp-rename'),
concat      = require('gulp-concat'),
del         = require('del'),
gulpif      = require('gulp-if'),
extend      = require('gulp-extend'),
replace     = require('gulp-replace'),
inlineCss   = require('gulp-inline-css'),
inlinesource= require('gulp-inline-source'),
del         = require('del'),
fs          = require('fs'),
reload      = browserSync.reload;

var nunjucksRender = require('gulp-nunjucks-render');
var data = require('gulp-data');
var path = require('path'); // Use to get the specific data for partials context

gulp.task('data', function() {

    // del('./sources/data/data.json').then(function(paths) {
    //     fs.writeFileSync('./sources/data/data.json', '{}');
    // });

    return gulp.src("./sources/data/*.json")
        .pipe(extend("data.json"))
        .pipe(gulp.dest("./sources/data"))
});

// HTML
gulp.task('html', function() {
    nunjucksRender.nunjucks.configure(['sources/templates', 'sources/partials']);

    // Gets .html and .nunjucks files in pages
    return gulp.src('sources/emails/**/*.html')
        .pipe(data(function() {
            return require('./sources/data/data.json')
        }))
        // Renders template with nunjucks
        .pipe(nunjucksRender())
        // output files in app folder
        .pipe(gulp.dest('sources/temporary'));
});

// Styles
gulp.task('styles', function() {
    return gulp.src('sources/scss/style.scss')
        .pipe(sass({
            style: 'expanded',
            errLogToConsole: true
        }))
        .pipe(gulp.dest('sources/temporary'));
});

// Inject style
gulp.task('inline', function() {
    return gulp.src('sources/temporary/*.html')
        .pipe(inlinesource())
        .pipe(inlineCss())
        .pipe(gulp.dest('./statics'));
});

// Images
gulp.task('images', function() {
    return gulp.src(['sources/images/**/*.{jpg,png}'])
        .pipe(cache(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('sources/temporary/images'));
});

// Clean
gulp.task('clean', function(cb) {
    del(['statics/*.html', 'sources/temporary/*.html'], cb);
});

// Serve
gulp.task('serve', function() {
    browserSync({
        server: {
            baseDir: 'sources/temporary/'
        }
    });
});


// Default task
gulp.task('default', ['clean'], function() {
    gulp.start( 'html', 'styles', 'serve', 'watch');
});

// build task
gulp.task('built', ['clean'], function() {
    gulp.start( 'html', 'styles', 'inline');
});


// Watch
gulp.task('watch', function() {

    // Watch .html/.htm files
    gulp.watch(['sources/{,**/}*.html'], ['html']);

    // Watch .scss files
    gulp.watch('sources/{,**/}*.scss', ['styles']);

    // Watch any files in statics/, reload on change
    gulp.watch(['sources/temporary/*.*']).on('change', reload);

});