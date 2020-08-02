import gulp from 'gulp';
import babel from 'gulp-babel';
import sass from 'gulp-sass';
import postcss from 'gulp-postcss';
import sourcemaps from 'gulp-sourcemaps';
import concat from 'gulp-concat';
import imagemin from 'gulp-imagemin';
import uglify from 'gulp-uglify';

import normalize from 'postcss-normalize';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import vinylPaths from 'vinyl-paths';
import del from 'del';
import fs from 'fs';

const { src, dest, series, parallel, watch } = gulp;

const js = () => src([
    'node_modules/jquery/dist/jquery.js',
    'node_modules/bootstrap/dist/js/bootstrap.bundle.js',
    'js/**.js'
  ])
  .pipe(sourcemaps.init())
  .pipe(babel({ 
    presets: ['@babel/env'] 
  }))
  .pipe(concat('app.js'))
  .pipe(uglify())
  .pipe(sourcemaps.write('.'))
  .pipe(dest('./public/js'))

const css = () => src([
    'css/**.css',
    'sass/**.scss'
   ])
  .pipe(sass().on('error', sass.logError))
  .pipe(sourcemaps.init())
  .pipe(postcss([
    autoprefixer(),
    normalize(),
    cssnano(),
  ]))
  .pipe(concat('app.css'))
  .pipe(sourcemaps.write('.'))
  .pipe(dest('./public/css'))

const img = () => src('img/**')
   .pipe(imagemin())
  .pipe(dest('./public/img'))

const font = () => 
  src([
    'node_modules/@fortawesome/fontawesome-free/webfonts/*.woff*',
    'font/**'
  ])
  .pipe(dest('./public/font'))

export const live = () => 
  watch('sass', 'css', 'js', 'img', 'font')

export const clean = () =>
  del([
    './public/css/**',
    './public/js/**',
    './public/font/**',
    './public/icon/**',
  ], { force: true })

export const build = parallel(js, css, img, font)

export default series(
  clean,
  build
)