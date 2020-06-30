import gulp from 'gulp';
import babel from 'gulp-babel';
import sass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import sourcemaps from 'gulp-sourcemaps';
import concat from 'gulp-concat';
import imagemin from 'gulp-imagemin';
import vinylPaths from 'vinyl-paths';
import del from 'del';
import uglify from 'gulp-uglify';

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
  .pipe(dest('../website/js'))

const css = () => src('sass/**.scss')
  .pipe(sass().on('error', sass.logError))
  .pipe(sourcemaps.init())
  .pipe(autoprefixer())
  .pipe(concat('app.css'))
  .pipe(sourcemaps.write('.'))
  .pipe(dest('../website/css'))

const img = () => src('img/**')
   .pipe(imagemin())
  .pipe(dest('../website/img'))

const font = () => 
  src([
    'node_modules/@fortawesome/fontawesome-free/webfonts/*',
    'font/**'
  ])
  .pipe(dest('../website/font'))

export const live = () => 
  watch('sass/**.scss', 'css')

export const clean = () =>
  del([
    '../website/css/**.css',
    '../website/js/**.js',
    '../website/font/**',
    '../img/**'
  ], { force: true })

export const build = parallel(js, css, img, font)

export default series(
  clean,
  build
)