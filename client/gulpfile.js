const gulp = require("gulp");
const ts = require("gulp-typescript").createProject('../tsconfig.json', { declaration: true, removeComments: false });
const sourcemaps = require('gulp-sourcemaps');

//编译TS代码
gulp.task("compile", function () {
    return gulp.src('src/**/*.ts')
        .pipe(sourcemaps.init())
        .pipe(ts())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('bin'));
});