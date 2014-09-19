var src  = './<%= config.get("sourceDir") %>';
var dest = './<%= config.get("destinationDir") %>';

module.exports = {
  serverport: 3000,
  <% if (browsersync) { %>
  browserSync: {
    server: {
      baseDir: [dest, src]
    },
    files: ['' + dest + '/**', '!' + dest + '/**.map']
  }, <% } %>
  stylesheets: {
    src: '' + src + '/sass/*' + cssExt,
    dest: dest
  },

  scripts: {
    src: '' + src + '/javascript/**/*' + jsExt,
    dest: dest
  },

  images: {
    src: '' + src + '/images/**',
    dest: '' + dest + '/images'
  },

  dist: {
    root: dest
  },
  <% if (webpack) { %>
  webpack: {
  }, <% } if (browserify) { %>
  browserify: {
    entries: <%= bundleEntries %>,
    extensions: <% config.get('browserifyExts') %>, // not implemented
    bundleName: 'app.js',
    dest: dest
  } <% } %>
};
