import gulp from 'gulp';
import babel from 'gulp-babel';
import sass from 'gulp-dart-sass';
import postcss from 'gulp-postcss';
import concat from 'gulp-concat';
import imagemin, { gifsicle, mozjpeg, optipng, svgo } from 'gulp-imagemin';
import uglify from 'gulp-uglify';
import changed from 'gulp-changed-in-place';
import cachebust from 'gulp-cache-bust';
import htmlmin from 'gulp-htmlmin';

import normalize from 'postcss-normalize';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import del from 'del';

const { src, dest, series, parallel, watch, lastRun } = gulp;

const paths = {
  js: {
    src: [
      'node_modules/jquery/dist/jquery.js',
      'js/**.js'
    ],
    dest: './public/js',
  },
  css: {
    src: [
      'css/**/*.css',
      'sass/**/*.scss'
    ],
    dest: './public/css'
  },
  img: {
    src: [
      'static/img/**'
    ],
    dest: './public/img'
  },
  font: {
    src: [
      'node_modules/@fortawesome/fontawesome-free/webfonts/*.woff*',
      'static/font/**'
    ],
    dest: './public/font'
  },
  files: {
    src: [
      'static/*.html',
      'static/*.txt',
      'static/icon/**/*',
    ],
    dest: './public'
  },
  sourcemaps: "maps"
}

const js = () => src(paths.js.src, {
  since: lastRun(js),
  sourcemaps: true
})
  .pipe(changed({ firstPass: true }))
  .pipe(babel({
    presets: ['@babel/env']
  }))
  .pipe(concat('app.min.js'))
  .pipe(uglify())
  .pipe(dest(paths.js.dest, { sourcemaps: paths.sourcemaps }))

const css = () => src(paths.css.src, {
  since: lastRun(css),
  sourcemaps: true
})
  .pipe(changed({ firstPass: true }))
  .pipe(sass().on('error', sass.logError))
  .pipe(postcss([
    autoprefixer(),
    normalize(),
    cssnano(),
  ]))
  .pipe(concat('app.min.css'))
  .pipe(dest(paths.css.dest, { sourcemaps: paths.sourcemaps }))

const img = () => src(paths.img.src, {
  since: lastRun(img),
})
  .pipe(changed({ firstPass: true }))
  .pipe(imagemin([
    gifsicle(),
    mozjpeg(),
    optipng(),
    svgo()
  ], { silent: true }))
  .pipe(dest(paths.img.dest))

const font = () =>
  src(paths.font.src, {
    since: lastRun(font),
  })
    .pipe(changed({ firstPass: true }))
    .pipe(dest(paths.font.dest))

const files = () =>
  src(paths.files.src, {
    base: 'static',
    since: lastRun(font),
  })
    .pipe(gulp.dest(paths.files.dest))

export const cache = () =>
  src('public/**/*.html')
    .pipe(cachebust())
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('public'));

export const live = () =>
  watch('css', 'js', 'img', 'font')

export const clean = () =>
  del([
    './public/**',
  ], { force: true })

export const build = parallel(js, css, img, font, files)

export default series(
  build,
  cache
)