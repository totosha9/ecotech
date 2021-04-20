var gulp = require("gulp"),
    browsersync = require("browser-sync").create(),
    autoprefixer = require("gulp-autoprefixer"),
    pug = require("gulp-pug"),
    sass = require("gulp-sass"),
    mincss = require("gulp-clean-css"),
    sourcemaps = require("gulp-sourcemaps"),
    rename = require("gulp-rename"),
    favicons = require("gulp-favicons"),
    replace = require("gulp-replace"),
    newer = require("gulp-newer"),
    plumber = require("gulp-plumber"),
    debug = require("gulp-debug"),
    watch = require("gulp-watch"),
    clean = require("gulp-clean"),
    rsync = require('gulp-rsync'),
    imagemin = require('gulp-imagemin'),
    webpack = require('webpack'),
    webpackStream = require('webpack-stream'),
    ftp = require( 'vinyl-ftp' );

let $img = ["./src/img/**/*.{jpg,jpeg,png,gif}", "!./src/img/favicons/*.{jpg,jpeg,png,gif}"],
    $pug = ["./src/views/**/*.pug", "!./src/views/blocks/*.pug", "!./src/views/layout/*.pug"],
    $pug_all = "./src/views/**/*.pug",
    $scripts = "./src/js/common.js",
    $styles = "./src/styles/**/*.scss",
    $favicons = "./src/img/favicons/*.{jpg,jpeg,png,gif}",
    $other = ["./src/**/*", "!./src/img/**/*.{jpg,jpeg,png,gif}", "!./src/js/**/*", "!./src/styles/**/*", "!./src/views/**/*", "!./src/views"];

gulp.task("pug", function () {
  return gulp.src($pug)
    .pipe(pug({
      pretty: true
    }))
    .pipe(replace("../build/", "../"))
    .pipe(gulp.dest("./build/"))
    .pipe(debug({
      "title": "html"
    }))
    .on("end", browsersync.reload);
});

gulp.task("scripts", function () {
  return gulp.src($scripts)
    .pipe(webpackStream({
      mode: 'development',
      output: {
        filename: 'common.min.js',
      },
      performance: {
        hints: false,
        maxEntrypointSize: 1000,
        maxAssetSize: 1000
      },
      externals: {
        jquery: 'jQuery'
      },
      module: {
        rules: [{
          test: /\.(js)$/,
          exclude: /(node_modules)/,
          loader: 'babel-loader',
          options: {
            presets: [["@babel/preset-env"]]
          }
        }]
      }
    }))
    .pipe(gulp.dest("./build/js/"))
    .pipe(debug({"title": "scripts"}))
    .on("end", browsersync.reload);
});
gulp.task("scripts-production", function () {
  return gulp.src($scripts)
    .pipe(webpackStream({
      mode: 'production',
      output: {
        filename: 'common.min.js',
      },
      performance: {
        hints: false,
        maxEntrypointSize: 1000,
        maxAssetSize: 1000
      },
      externals: {
        jquery: 'jQuery'
      },
      module: {
        rules: [{
          loader: 'babel-loader',
          options: {
            presets: [["@babel/preset-env"]]
          }
        }]
      }
    }))
    .pipe(gulp.dest("./build/js/"))
    .pipe(debug({"title": "scripts"}))
    .on("end", browsersync.reload);
});

gulp.task("styles", function () {
  return gulp.src($styles)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(gulp.dest("./build/styles/"))
    .pipe(mincss())
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(replace("../../build/", "../"))
    .pipe(plumber.stop())
    .pipe(sourcemaps.write("./maps/"))
    .pipe(gulp.dest("./build/styles/"))
    .on("end", browsersync.reload);
});

gulp.task("images", function () {
  return gulp.src($img)
    .pipe(newer("./build/img/"))
    .pipe(imagemin([
      imagemin.mozjpeg({quality: 80, progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
    ]))
    .pipe(gulp.dest("./build/img/"))
    .pipe(debug({
      "title": "images"
    }))
    .on("end", browsersync.reload);
});

gulp.task("favicons", function () {
  return gulp.src($favicons)
    .pipe(favicons({
      icons: {
        appleIcon: true,
        favicons: true,
        online: false,
        appleStartup: false,
        android: false,
        firefox: false,
        yandex: false,
        windows: false,
        coast: false
      }
    }))
    .pipe(gulp.dest("./build/img/favicons/"))
    .pipe(debug({
      "title": "favicons"
    }));
});

gulp.task("other", function () {
  return gulp.src($other)
    .pipe(gulp.dest("./build/"))
    .on("end", browsersync.reload);
});

gulp.task("clean", function () {
  return gulp.src("./build/*", {
      read: false
    })
    .pipe(clean())
    .pipe(debug({
      "title": "clean"
    }));
});

gulp.task("serve", function () {
  return new Promise((res, rej) => {
    browsersync.init({
      server: "./build/",
      tunnel: false,
      port: 9000
    });
    res();
  });
});

gulp.task("watch", function () {
  return new Promise((res, rej) => {
    watch($pug_all, gulp.series("pug"));
    watch($styles, gulp.series("styles"));
    watch($scripts, gulp.series("scripts"));
    watch($img, gulp.series("images"));
    watch($favicons, gulp.series("favicons"));
    watch($other, gulp.series("other"));
    res();
  });
});

gulp.task("default", gulp.series("clean",
  gulp.parallel("pug", "styles", "scripts", "images", "favicons", "other"),
  gulp.parallel("watch", "serve")
));


