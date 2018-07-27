var gulp 			=	require("gulp");					//gulp核心
var minicss 		=	require("gulp-minify-css");			//CSS压缩
var concat 			=	require("gulp-concat");				//文件合并
var uglify 			=	require("gulp-uglify");				//JS压缩
//var tinypng 		=	require("gulp-tinypng");			//tinypng图片压缩
var autoprefixer 	= 	require('gulp-autoprefixer');		//自动前缀
var clean 			=	require('gulp-clean'); 				//清空文件夹，避免文件冗余
var miniImg 		= 	require('gulp-imagemin');			//图片压缩
var browserSync 	= 	require('browser-sync').create();	//创建一个browserSync实例
var sass 			= 	require('gulp-sass');				//sass转换工具
var gulpCopy 		= 	require('gulp-copy');
var babel           =   require("gulp-babel");
var gulpSequence 	= 	require('gulp-sequence');			//队列执行任务插件
var pngquant = require('imagemin-pngquant'); //png图片压缩插件
var plumber = require('gulp-plumber');
/****************目录常量配置*********************/
var  	sourceDir = "./src/",								//源文件根目录
		htmlSourceDir = sourceDir+"html/",					//源HTML文件目录
		cssSourceDir = sourceDir+"css/",					//源CSS文件目录
		jsSourceDir = sourceDir+"js/",						//源JS文件目录
		scssSourceDir = sourceDir+"scss/",					//源Scss文件目录
		imgSourceDir = sourceDir+"img/",					//源图片文件目录
		fontSourceDir = sourceDir+"font/",					//源字体文件目录
		mediaSourceDir = sourceDir+"media/",				//源媒体文件目录

		targetDir = "./dist/",								//目标文件根目录
		htmlTargetDir = targetDir+"html/",					//目标HTML文件目录
		cssTargetDir = targetDir+"css/",					//目标CSS文件目录
		jsTargetDir = targetDir+"js/",						//目标JS文件目录
		imgTargetDir = targetDir+"img/",					//目标JS文件目录
		fontTargetDir = targetDir+"font/",					//目标字体文件目录
		mediaTargetDir = targetDir+"media/",				//目标媒体文件目录

		revDir = "./rev/";									//转换文件对应关系的json存放目录

/****************子任务：清空文件夹*********************/
gulp.task('clean',function(){
	return gulp.src([targetDir],{read: false})	//清空dist和rev文件夹
		.pipe(clean());
});

/****************子任务：拷贝静态文件*********************/
gulp.task('copy', function() {
	gulp.src(fontSourceDir+"**/*").pipe(gulpCopy(fontTargetDir,{prefix:"2"}))//复制font文件,后面的prefix:2表示忽略前两个父目录
	gulp.src(mediaSourceDir+"**/*").pipe(gulpCopy(mediaTargetDir,{prefix:"2"}))//复制媒体文件,后面的prefix:2表示忽略前两个父目录
})

/****************子任务：转变scss到css*********************/
gulp.task('dev_scss', function () {
  	gulp.src(scssSourceDir+'**/*.scss')
  		.pipe(plumber())
	    .pipe(sass())
	    .pipe(plumber())
	    //自动添加前缀
	    .pipe(autoprefixer({
            browsers: ['last 2 versions', 'Android >= 4.0','iOS 7','last 3 Safari versions'],
            cascade: false, 	//是否美化属性值 默认：true 像这样：
								//-webkit-transform: rotate(45deg);
								//        transform: rotate(45deg);
			remove:false 		//是否去掉不必要的前缀 默认：true
        }))
	    .pipe(gulp.dest(cssSourceDir));
});

/****************子任务：使用Browsersync  同步刷新************/
var reload = browserSync.reload;
gulp.task('dev_browserSync', function() {
    browserSync.init({
		port:3030,
        server: {
            baseDir: sourceDir,
            index:"index.html"
        }
    });
});

/****************子任务：压缩JS************/
gulp.task('pro_js', function () {
	return gulp.src(jsSourceDir+'**/*.js')
		.pipe(babel({presets:["es2015"]}))
		.pipe(uglify())                 //进行压缩
		.pipe(gulp.dest(jsTargetDir));
});

//console.log(imgSourceDir+'**/*');
/****************子任务：压缩图片，添加MD5后缀，并生成json对应文件************/
gulp.task('pro_img', function () {
	return gulp.src(imgSourceDir+'**/*')
		// .pipe(tinypng('aQ3TnjXTKXb9TMIt994Q80ZTjvIzxmic'))	//使用tiny压缩图片
		//.pipe(miniImg())										//使用插件压缩图片
		.pipe(miniImg({
            progressive: true,
            use: [pngquant()] //使用pngquant来压缩png图片
        }))
		.pipe(gulp.dest(imgTargetDir))
});
/***子任务：根据图片的后缀名JSON对照表，替换对应图片名称，压缩CSS,添加MD5后缀，并生成json对应文件*****/
gulp.task("pro_css",function(){
		return gulp.src(cssSourceDir+'**/*.css')
		.pipe(minicss())			//进行压缩
		.pipe(gulp.dest(cssTargetDir))
});
/****************子任务：替换文件路径,并拷贝HTML到生成目录************/
gulp.task('pro_rev_html', function () {
	return gulp.src(htmlSourceDir+'**/*.html')
		.pipe( gulp.dest(htmlTargetDir) );	//生成到目标HTML目录
})

/****************总任务：一键用于开发环境************/
gulp.task("dev",["dev_browserSync"],function(){

	//监听任何文件变化,实时刷新
	gulp.watch(htmlSourceDir+"**/*.html").on("change",reload);
	gulp.watch(cssSourceDir+"**/*.css").on("change",reload);
	gulp.watch(jsSourceDir+"**/*.js").on("change",reload);
	gulp.watch(scssSourceDir+'**/*.scss',['dev_scss']);
})

/****************总任务：一键生成生产环境文件************/
gulp.task("pro",gulpSequence("clean","dev_scss","pro_img","pro_css","pro_js","pro_rev_html","copy"));