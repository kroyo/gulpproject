'use strict';

const gulp = require('gulp');
// sass
const sass = require('gulp-sass');
// css压缩
const cleanCSS = require('gulp-clean-css');
// js合并
const concat = require('gulp-concat');
// babel => es6转es5
const babel = require('gulp-babel');
// js压缩
const uglify = require('gulp-uglify');

const pump = require('pump');

// 嵌入页面
// https://www.npmjs.com/package/gulp-tag-include
const htmlIncluder = require('gulp-tag-include');

// 监听
const watch = require('gulp-watch');
// postcss
const postcss = require('gulp-postcss');
const autoprefixerPost = require('autoprefixer');
const cssnano = require('cssnano');
const cssnext = require("postcss-cssnext");
const precss = require('precss');

//清除注释
// https://www.npmjs.com/package/gulp-htmlmin
// https://github.com/kangax/html-minifier
const htmlmin = require('gulp-htmlmin');

// 监听
// https://browsersync.io/docs/gulp
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;


// 📂自定义文件夹路径
const _path = './ShowSpecial/template/';
const _outputOnce = './ShowSpecial/build/';
const _outputPath = './ShowSpecial/dist/';

// sass
gulp.task('sass', () => {
    return gulp.src(_path + 'scss/*.scss')
        .pipe(sass.sync().on('error', sass.logError))
        //第一次编译
        .pipe(gulp.dest(_outputOnce + '/css'));

});

// css补前缀
gulp.task('postcss-cssnext', function () {
    const plugins = [
        cssnext({ warnForDuplicates: false }),
        autoprefixerPost({browsers: ['last 2 version']}),
        cssnano()
    ];
    return gulp.src(_outputOnce + 'css/*.css')
        .pipe(postcss(plugins))
        .pipe(gulp.dest(_outputPath + 'css'));
});

// css压缩
gulp.task('css-minify', () => {
    return gulp.src(_path + 'css/*.css')
        .pipe(cleanCSS({
            compatibility: 'ie8'
        }))
        .pipe(gulp.dest(_path + 'dist/css/min'));
});

// babel
gulp.task('js-babel', () => {
    gulp.src(_path + 'es6js/*.js')
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(gulp.dest(_outputPath + 'js'))
});

// js合并
gulp.task('js-concat', () => {
    return gulp.src(_path + 'dist/*.js')
        .pipe(concat('all.js'))
        .pipe(gulp.dest(_path + 'dist/js'));
});

// js压缩
gulp.task('compress', function (cb) {
    pump([
        gulp.src(_path + 'dist/*.js'),
        uglify(),
        gulp.dest(_path + 'dist/js/min')
    ], );
});

// 嵌入页面
gulp.task('build-html', () => {
    gulp.src(_path + '**/*.html')
        .pipe(htmlIncluder())
        .pipe(gulp.dest(_outputOnce));
});

//清除注释
gulp.task('html-minify', function() {
    return gulp.src(_outputOnce + 'page/*.html')
        .pipe(htmlmin({
            removeComments: true
        }))
        .pipe(gulp.dest(_outputPath));
});

gulp.task('server', ['build-html','html-minify', 'sass'], function() {
    browserSync.init({
        server: "./ShowSpecial/dist"
    });
    //嵌入公共模块
    gulp.watch(_path + 'layout/**/*.html', ['build-html']);
    gulp.watch(_path + 'page/**/*.html', ['build-html']);
    gulp.watch(_path + 'components/**/*.html', ['build-html']);
    //取消注释
    gulp.watch(_outputOnce + 'page/**/*.html', ['html-minify']);
    //scss编译css
    gulp.watch(_path + 'scss/**/*.scss', ['sass']);
    //css补前缀兼容性
    gulp.watch(_outputOnce + 'css/**/*.css', ['postcss-cssnext']);
    //cs6转es5
    gulp.watch(_path + 'es6js/*.js', ['js-babel']);
    //检测页面文件修改刷新页面
    gulp.watch(_path + '**/*.html').on('change', browserSync.reload);
    gulp.watch(_outputOnce + 'css/**/*.css').on('change', browserSync.reload);
});

gulp.task('default', ['server'], () => {});