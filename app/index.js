var chalk     = require('chalk');
var keyMirror = require('keymirror');
var path      = require('path');
var util      = require('util');
var yeoman    = require('yeoman-generator');
var yosay     = require('yosay');

var GulpGenerator = module.exports = function GulpGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);
  this.options = options;
};

util.inherits(GulpGenerator, yeoman.generators.Base);

GulpGenerator.prototype.askFor = function askFor() {
  var done = this.async();

  // welcome message
  if (!this.options['skip-welcome-message']) {
    this.log(yosay('Let\'s Gulp!'));
    this.log(chalk.green('Please tell me what you want from your gulp build process.'));
  }

  /*
  ### Prompts ###

  1. *Which flavor of CSS?
    (*) SCSS
    ( ) SASS
    ( ) Vanilla

  2. *Which flavor of JS?
    (*) Vanilla
    ( ) Coffeescript [ -> if CS, config as .coffee ]

  3. *Would you like to use Browserify or Webpack?
    ( ) Browserify
    ( ) Webpack
    ( ) Nope

  4. *Which of these would you like included?

    -- Additional Gulp Tasks
    [ ] Image Sprites
    [ ] Iconfont
    [ ] Production (minify + rev)

    -- Transforms
    [ ] Coffeescript
    [ ] Handlebars
    [ ] React JSX
    [ ] Haml

    -- Dependencies
    [ ] Jquery
    [ ] Underscore
    [ ] Angular

  5. Input directory? (default: './src')
  6. Output directory? (default: './dist')
  7. Javascript directory? (default: './src/javascripts')
  8. Stylesheet directory? (default: './src/stylesheets')

  */
  var includePacker = function(answers) {
    return answers.packer !== 'none';
  };

  var excludeCoffeescript = function(answers) {
    if (answers.js == 'javascript') {
      return "Disabled because you chose 'javascript'."
    }
  };

  var excludeReactify = function(answers) {
    if (answers.projectDependencies.indexOf('react') === -1) {
      return "Disabled because you didn't include React."
    }
  };

  var objFromArr = function(arr) {
    if (Array.isArray(arr) === false) return {};
    return arr.reduce(function(o, v, i) {
      o[v] = i; return o;
    }, {});
  };

  var prompts = [{
    type: 'list',
    name: 'css',
    message: 'Which flavor of CSS would you like?',
    choices: [{
      name: 'SCSS',
      value: 'scss'
    }, {
      name: 'SASS',
      value: 'sass'
    },{
      name: 'CSS',
      value: 'css'
    }]
  },{
    type: 'list',
    name: 'js',
    message: 'Which flavor of Javascript would you like?',
    choices: [{
      name: 'Javascript',
      value: 'javascript'
    }, {
      name: 'Coffeescript',
      value: 'coffeescript'
    }]
  },{
    type: 'checkbox',
    name: 'projectDependencies',
    message: 'Should I set up any of these as project dependencies?',
    choices: [{
      name: 'jQuery',
      value: 'jquery'
    },{
      name: 'Underscore',
      value: 'underscore'
    },{
      name: 'Backbone',
      value: 'backbone'
    },{
      name: 'React',
      value: 'react',
    },{
      name: 'Angular',
      value: 'angular'
    }]
  },{
    name: 'sourceDir',
    message: 'Source directory?',
    default: 'src'
  },{
    name: 'destinationDir',
    message: 'Output directory?',
    default: 'dist'
  },{
    name: 'javascriptsDir',
    message: 'Javascripts directory?',
    default: 'javascripts'
  },{
    name: 'stylesheetsDir',
    message: 'Stylesheets directory?',
    default: 'stylesheets'
  },{
    type: 'list',
    name: 'packer',
    message: 'Would you like to use Browserify or Webpack?',
    choices: [{
      name: 'Nope',
      value: 'none'
    },{
      name: 'Browserify',
      value: 'Browserify'
    },{
      name: 'Webpack',
      value: 'webpack'
    }]
  },{
    when: includePacker,
    name: 'bundleEntries',
    message: 'Bundle entry points: (comma-separated list of filenames, sans extension)',
    filter: function(input) { return input.split(', '); }
  },{
    when: includePacker,
    type: 'checkbox',
    name: 'transforms',
    message: 'Do you need any source transforms?',
    choices: [{
      name: 'Coffeescript',
      value: 'coffeeify',
      disabled: excludeCoffeescript,
      checked: true
    },{
      name: 'Handlebars',
      value: 'hbsfy'
    },{
      name: 'React JSX',
      value: 'reactify',
      disabled: excludeReactify,
      checked: true
    },{
      name: 'Haml',
      value: 'hamlify'
    }]
  },{
    type: 'list',
    name: 'syncer',
    message: 'Would you like to use BrowserSync or Livereload?',
    choices: [{
      name: 'BrowserSync',
      value: 'browsersync'
    },{
      name: 'Livereload',
      value: 'livereload'
    },{
      name: 'Nope',
      value: 'none'
    }]
  },{
    type: 'checkbox',
    name: 'moreGulpTasks',
    message: 'Would you like to include any of these?',
    choices: [{
      name: 'Image Sprites Task',
      value: 'imagesprites'
    },{
      name: 'Iconfont Task',
      value: 'iconfont'
    },{
      name: 'Favicons Generation',
      value: 'favicons'
    },{
      name: 'Production Task (minify / version)',
      value: 'production'
    },{
      name: 'Combine Media Queries',
      value: 'combinequeries'
    }]
  }];

  this.prompt(prompts, function (answers) {
    console.log(answers);

    this.browsersync = (answers.syncer == 'browsersync');
    this.livereload  = (answers.syncer == 'livereload');

    this.browserify  = (answers.packer == 'browserify');
    this.webpack     = (answers.packer == 'webpack');

    this.scss        = (answers.css == 'scss');
    this.sass        = (answers.css == 'sass');
    this.css         = (answers.css == 'css');
    this.cssExt      = '.' + answers.css;

    this.coffee      = (answers.js == 'coffeescript');
    this.jsExt       = (answers.js == 'javascript' ? '.js' : '.coffee');

    this.bundleEntries = (answers.bundleEntries || []).forEach(function(v) {
      return v + this.jsExt;
    });

    // coffeeify, hamlify, reactify, hbsify
    this.transforms          = keyMirror(objFromArr(answers.transforms));
    // imagesprites, iconfont, favicons, production, combinequeries
    this.moreGulpTasks       = keyMirror(objFromArr(answers.moreGulpTasks));
    // jquery, underscore, angular, backbone
    this.projectDependencies = keyMirror(objFromArr(answers.projectDependencies));

    this.config.set({
      'sourceDir'      : answers.sourceDir,
      'destinationDir' : answers.destinationDir,
      'javascriptsDir' : answers.javascriptsDir,
      'stylesheetsDir' : answers.stylesheetsDir
    });

    // set up paths

    //console.log(this.config.getAll());

    done();
  }.bind(this));
};

GulpGenerator.prototype.writeGulpConfig = function () {
  this.configFile = 'gulp/config' + this.jsExt
  this.gulpConfig = this.readFileAsString(path.join(this.sourceRoot(), this.configFile));
  this.gulpConfig = this.engine(this.gulpConfig, this);
};

GulpGenerator.prototype.gulpfile = function () {
  // copy the gulpfile
  this.template('gulpfile.js');
};

GulpGenerator.prototype.scaffold = function () {
  // make gulp folders
  this.mkdir('gulp');
  this.mkdir('gulp/tasks');
  this.mkdir('gulp/util');

  var config = this.config.getAll();

  this.mkdir(config.sourceDir);
  this.mkdir(config.destinationDir);

  this.mkdir(config.sourceDir + '/' + config.javascriptsDir);
  this.mkdir(config.sourceDir + '/' + config.stylesheetsDir);

  // copy the gulp config
  this.write(this.configFile, this.gulpConfig);
};

GulpGenerator.prototype.packageJSON = function () {
  this.template('_package.json', 'package.json');
};

GulpGenerator.prototype.git = function () {
  this.copy('gitignore', '.gitignore');
  this.copy('gitattributes', '.gitattributes');
};

GulpGenerator.prototype.jshint = function () {
  this.copy('jshintrc', '.jshintrc');
};

GulpGenerator.prototype.editorConfig = function () {
  this.copy('editorconfig', '.editorconfig');
};

// GulpGenerator.prototype.install = function () {
//   var howToInstall =
//     '\nAfter running `npm install & bower install`, inject your front end dependencies into' +
//     '\nyour HTML by running:' +
//     '\n' +
//     chalk.yellow.bold('\n  gulp wiredep');

//   if (this.options['skip-install']) {
//     this.log(howToInstall);
//     return;
//   }

//   var done = this.async();
//   this.installDependencies({
//     skipMessage: this.options['skip-install-message'],
//     skipInstall: this.options['skip-install'],
//     callback: function () {
//       var bowerJson = JSON.parse(fs.readFileSync('./bower.json'));

//       // wire Bower packages to .html
//       wiredep({
//         bowerJson: bowerJson,
//         directory: 'bower_components',
//         exclude: ['bootstrap-sass', 'bootstrap.js'],
//         src: 'app/index.html'
//       });

//       if (this.includeSass) {
//         // wire Bower packages to .scss
//         wiredep({
//           bowerJson: bowerJson,
//           directory: 'bower_components',
//           src: 'app/styles/*.scss'
//         });
//       }

//       done();
//     }.bind(this)
//   });
// };
