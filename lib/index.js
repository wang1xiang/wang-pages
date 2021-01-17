const { src, dest, parallel, series, watch } = require("gulp");

const del = require("del");
const browserSync = require("browser-sync");

const loadPlugins = require("gulp-load-plugins");

const plugins = loadPlugins();
const bs = browserSync.create();
const cwd = process.cwd();
let config = {
  // default config
  build: {
    src: "src",
    dist: "dist",
    temp: "temp",
    public: "public",
    paths: {
      styles: "assets/styles/*.scss",
      scripts: "assets/scripts/*.js",
      pages: "*.html",
      images: "assets/images/**",
      fonts: "assets/fonts/**",
    },
  },
};

try {
  const loadConfig = require(`${cwd}/pages.config.js`);
  config = Object.assign({}, config, loadConfig);
} catch (e) {}
const {
  build: {
    dist,
    src: srcDic,
    temp,
    public,
    paths: { styles, scripts, pages, images, fonts },
   },
} = config;

const clean = () => {
  return del([dist, temp]);
};

const style = () => {
  return src(styles, {
    base: srcDic,
    cwd: srcDic,
  })
    .pipe(plugins.sass({ outputStyle: "expanded" }))
    .pipe(dest(temp))
    .pipe(bs.reload({ stream: true }));
};

const script = () => {
  return src(scripts, {
    base: srcDic,
    cwd: srcDic,
  })
    .pipe(plugins.babel({ presets: [require("@babel/preset-env")] }))
    .pipe(dest(temp))
    .pipe(bs.reload({ stream: true }));
};

const page = () => {
  return src(pages, {
    base: srcDic,
    cwd: srcDic,
  })
    .pipe(plugins.swig({ data: config.data, defaults: { cache: false } }))
    .pipe(dest(temp))
    .pipe(bs.reload({ stream: true }));
};

const image = () => {
  return src(images, {
    base: srcDic,
    cwd: srcDic,
  })
    .pipe(plugins.imagemin())
    .pipe(dest(dist));
};

const font = () => {
  return src(fonts, {
    base: srcDic,
    cwd: srcDic,
  })
    .pipe(plugins.imagemin())
    .pipe(dest(dist));
};

const extra = () => {
  return src("**", {
    base: public,
    cwd: public,
  }).pipe(dest(dist));
};

const serve = () => {
  watch(styles, { cwd: srcDic }, style);
  watch(scripts, { cwd: srcDic }, script);
  watch(pages, { cwd: srcDic }, page);
  // watch('src/assets/images/**', image)
  // watch('src/assets/fonts/**', font)
  // watch('public/**', extra)
  watch([images, fonts], { cwd: srcDic }, bs.reload);

  watch("**", { cwd: public }, bs.reload);

  bs.init({
    notify: false,
    port: 2080,
    // open: false,
    // files: 'dist/**',
    server: {
      baseDir: [temp, dist, public],
      routes: {
        "/node_modules": "node_modules",
      },
    },
  });
};

const useref = () => {
  return (
    src(pages, {
      base: temp,
      cwd: temp,
    })
      .pipe(plugins.useref({ searchPath: [temp, "."] }))
      // html js css
      .pipe(plugins.if(/\.js$/, plugins.uglify()))
      .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
      .pipe(
        plugins.if(
          /\.html$/,
          plugins.htmlmin({
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: true,
          })
        )
      )
      .pipe(dest(dist))
  );
};

const compile = parallel(style, script, page);

// 上线之前执行的任务
const build = series(
  clean,
  parallel(series(compile, useref), image, font, extra)
);

const develop = series(compile, serve);

module.exports = {
  clean,
  build,
  develop,
};
