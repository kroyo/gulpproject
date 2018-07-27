/**
 * gulpfile 配置文件
 * gkroyo
 * version   v1.0.0
 * gulp v3.9.1
 */

'use strict';


const gulp = require('gulp');
const browerSync = require('browser-sync').create(); // 创建一个browserSync实例
const sass = require('gulp-sass'); // sass转换工具
const babel = require('gulp-babel'); // babel => es6转es5
const autoprefixer = require('gulp-autoprefixer');


//目录常量配置
const sourceDir = './src/',								//源文件根目录
	  htmlSourceDir = sourceDir + 'page/',				//源HTML文件目录
	  cssSourceDir = sourceDir + 'css/',				//源CSS文件目录
	  jsSourceDir = sourceDir + 'js/',					//源JS文件目录
	  scssSourceDir = sourceDir + 'scss/',				//源Scss文件目录
	  imgSourceDir = sourceDir + 'img/',				//源图片文件目录
	  fontSourceDir = sourceDir + 'font/',				//源字体文件目录
	  mediaSourceDir = sourceDir + 'media/',			//源媒体文件目录
	  
	  targetDir = './dist/',							//目标文件根目录
	  htmlTargetDir = targetDir + 'page/',				//目标HTML文件目录
	  cssTargetDir = targetDir + 'css/',				//目标CSS文件目录
	  jsTargetDir = targetDir + 'js/',					//目标JS文件目录
	  imgTargetDir = targetDir + 'img/',				//目标JS文件目录
	  fontTargetDir = targetDir + 'font/',				//目标字体文件目录
	  mediaTargetDir = targetDir + 'media/',			//目标媒体文件目录

	  revDir = "./rev/";								//转换文件对应关系的json存放目录


//使用Browsersync  同步刷新
const reload = browerSync.reload();
gulp.task('dev_browserSync',() => {
	browerSync.init({
		port: 3030,
		server: {
			baseDir: sourceDir,
			index: 'index.html'
		}
	});
})


//sass
gulp.task('dev_scss',() => {
	return gulp.src(scssSourceDir + '**/*.scss')
		.pipe(sass())
		.pipe(gulp.dest(cssSourceDir));
});


//一键用于开发环境
gulp.task('dev',() => {
	//scss编译css
	gulp.watch(scssSourceDir + '**/*.scss',['dev_scss']);
	//监听任何文件变化，实时刷新
	gulp.watch(cssSourceDir + '**/*.css').on('change',reload);
})
