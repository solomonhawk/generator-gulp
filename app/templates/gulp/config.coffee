# not up to date

src  = './<%= config.get("sourceDir") %>'
dest = './<%= config.get("destinationDir") %>'

module.exports =
  serverport: 3000
  <% if (browsersync) { %>
  browserSync:
    server:
      baseDir: [dest, src]
    files: ['' + dest + '/**', '!' + dest + '/**.map']
  <% } %>
  stylesheets:
    src: '' + src + '/sass/*.{sass, scss}'
    dest: dest
  scripts:
    src: '' + src + '/javascript/**/*.{js, coffee}'
    dest: dest
  images:
    src: '' + src + '/images/**'
    dest: '' + dest + '/images'
  dist:
    root: dest
  <% if (webpack) { %>
  webpack: true
  <% } if (browserify) { %>
  browserify:
    entries: ['' + src + '/javascript/app.coffee']
    extensions: ['.coffee', '.hbs']
    bundleName: 'app.js'
    dest: dest
  <% } %>
