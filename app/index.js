var chalk     = require('chalk');
var keyMirror = require('keymirror');
var path      = require('path');
var util      = require('util');
var yeoman    = require('yeoman-generator');
var fs        = require('fs');
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

  var transforms = {
    "coffeescript": {
      "transformer": "coffeeify",
      "extension": ".coffee"
    },
    "handlebars": {
      "transformer": "hbsfy",
      "extension": ".hbs"
    },
    "react": {
      "transformer": "reactify",
      "extension": ".jsx"
    },
    "haml": {
      "transformer": "hamlify",
      "extension": ".haml"
    }
  }

  var includePacker = function(answers) {
    return answers.packer !== 'none';
  };

  var excludeCoffeescript = function(answers) {
    if (answers.js == 'javascript') {
      return "Disabled because you didn't choose 'Coffeescript'."
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
      name: 'CSS Plain',
      value: 'css'
    }]
  },{
    type: 'list',
    name: 'js',
    message: 'Which flavor of Javascript would you like?',
    choices: [{
      name: 'Javascript',
      value: 'javascript'
    },{
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
    }]
  },{
    name: 'sourceDir',
    message: 'Source directory?',
    default: 'src'
  },{
    name: 'destinationDir',
    message: 'Build directory?',
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
    name: 'fontsDir',
    message: 'Fonts directory?',
    default: 'fonts'
  },{
    type: 'confirm',
    name: 'singleAssetsDir',
    message: 'Output all assets to one directory?',
    default: false
  },{
    when: function(answers) { return answers.singleAssetsDir; },
    name: 'assetsDir',
    message: 'Assets directory?',
    default: 'public/assets'
  },{
    type: 'checkbox',
    name: 'tasks',
    message: 'Which of these Tasks would you like me to set up?',
    choices: [{
      name: 'Images',
      value: 'images-task',
      checked: true
    },{
      name: 'Fonts',
      value: 'fonts-task'
    },{
      name: 'Iconfont',
      value: 'iconfont-task'
    },{
      name: 'Sass',
      value: 'sass-task',
      checked: true
    },{
      name: 'Bundle JS',
      value: 'bundle-task',
      checked: true
    },{
      name: 'Markup',
      value: 'markup-task',
      checked: true
    },{
      name: 'Production',
      value: 'production-task',
      checked: true
    },{
      name: 'Imagesprites',
      value: 'sprites-task'
    },{
      name: 'SVG Imagesprites',
      value: 'svg-sprites-task'
    },{
      name: 'Server',
      value: 'server-task'
    }]
  },{
    type: 'list',
    name: 'packer',
    message: 'Would you like to use Browserify or Webpack?',
    choices: [{
      name: 'Nope',
      value: 'none'
    },{
      name: 'Browserify',
      value: 'browserify'
    },{
      name: 'Webpack',
      value: 'webpack'
    }]
  },{
    when: includePacker,
    name: 'bundleEntries',
    message: 'Bundle entry points: (comma-separated list of filenames, sans extension)',
    filter: function(input) { return input.split(', '); },
    default: 'application'
  },{
    when: includePacker,
    type: 'checkbox',
    name: 'transforms',
    message: 'Do you need any source transforms?',
    choices: [{
      name: 'Coffeescript',
      value: 'coffeescript',
      disabled: excludeCoffeescript,
      checked: true
    },{
      name: 'Handlebars',
      value: 'handlebars'
    },{
      name: 'React JSX',
      value: 'react',
      disabled: excludeReactify,
      checked: true
    },{
      name: 'Haml',
      value: 'haml'
    }]
  },{
    type: 'list',
    name: 'syncer',
    message: 'Would you like to use BrowserSync?',
    choices: [{
      name: 'BrowserSync',
      value: 'browsersync'
    },{
      name: 'Nope',
      value: 'none'
    }]
  },{
    type: 'checkbox',
    name: 'moreGulpTasks',
    message: 'Would you like to support any of these?',
    choices: [{
      name: 'Favicons Generation',
      value: 'favicons'
    },{
      name: 'Combine Media Queries',
      value: 'combinequeries'
    }]
  }];

  this.prompt(prompts, function (answers) {
    console.log(answers);

    // ***** CHOICES *****
    this.scss        = (answers.css == 'scss');
    this.sass        = (answers.css == 'sass');
    this.css         = (answers.css == 'css');
    this.cssExt      = '.' + answers.css;

    this.coffee      = (answers.js == 'coffeescript');
    this.jsExt       = (answers.js == 'javascript' ? '.js' : '.coffee');

    this.browsersync = (answers.syncer == 'browsersync');

    this.browserify  = (answers.packer == 'browserify');
    this.webpack     = (answers.packer == 'webpack');


    // ***** BUNDLES *****
    this.bundleEntries = (answers.bundleEntries || []).map(function(v) {
      return v + this.jsExt;
    });

    this.transformers = (answers.transforms || []).map(function(v) {
      return transforms[v].transformer
    });

    this.browserifyExts = (answers.transforms || []).map(function(v) {
      return transforms[v].extension
    });


    // ***** INCLUSIONS *****
    this.transforms          = keyMirror(objFromArr(answers.transforms));
    this.includedTasks       = keyMirror(objFromArr(answers.tasks));
    this.projectDependencies = keyMirror(objFromArr(answers.projectDependencies));


    // ***** PATHS *****
    if (answers.assetsDir) {
      this.javascriptsDest = this.stylesheetsDest = answers.assetsDir;
    } else {
      this.javascriptsDest = answers.sourceDir + '/' + answers.javascriptsDir;
      this.stylesheetsDest = answers.sourceDir + '/' + answers.stylesheetsDir;
    }

    // ***** SET CONFIG *****
    this.config.set({
      'sourceDir'      : answers.sourceDir,
      'destinationDir' : answers.destinationDir,
      'javascriptsDir' : answers.javascriptsDir,
      'stylesheetsDir' : answers.stylesheetsDir,
      'assetsDir'      : answers.assetsDir
    });

    done();
  }.bind(this));
};

// copy and compile the gulp config
GulpGenerator.prototype.writeGulpConfig = function () {
  this.configFile = 'gulp/config' + this.jsExt
  this.gulpConfig = this.readFileAsString(path.join(this.sourceRoot(), this.configFile));
  this.gulpConfig = this.engine(this.gulpConfig, this);
};

// copy the gulpfile
GulpGenerator.prototype.gulpfile = function () {
  this.template('_gulpfile.js', 'gulpfile.js');
};

// scaffold all the files and folders
GulpGenerator.prototype.scaffold = function () {
  var config = this.config.getAll();

  // make gulp folders
  this.mkdir('gulp');

  // copy gulp/util files
  this.directory('gulp/util');

  // write the gulp config
  this.write(this.configFile, this.gulpConfig);

  // make source and dest folder
  this.mkdir(config.sourceDir);
  this.mkdir(config.destinationDir);

  // make css and js source dirs
  this.mkdir(config.sourceDir + '/' + config.javascriptsDir);
  this.mkdir(config.sourceDir + '/' + config.stylesheetsDir);

  // make css and js dest dirs
  this.mkdir(this.javascriptsDest);
  this.mkdir(this.stylesheetsDest);

  // find, copy, and compile gulp tasks
  var jsrx = new RegExp('(' + this.jsExt + ')\b', 'i');

  var tasks = fs.readdirSync(path.join(this.sourceRoot() + '/gulp/tasks/')).filter(function(value) {
    return jsrx.test(value);
  });

  tasks.forEach(function(task) {
    this.template('/gulp/tasks/' + task);
  });

  if (includedTasks.iconfont) {
    this.copy('gulp/tasks/templates/iconfont' + this.cssExt);
  };

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
