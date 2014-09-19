# A [Yeoman](http://yeoman.io/) Generator for Creating [Gulp Starter](https://github.com/greypants/gulp-starter)s

With inspiration from [gulp-starter](https://github.com/greypants/gulp-starter) and [generator-gulp-webapp](https://github.com/yeoman/generator-gulp-webapp).

## TODO:

* Write a more comprehensive plan
* Set up the installDependencies generator step
* Actually set up most of the conditionals within the tasks
* Eliminate questions that aren't useful
* Find a more logical ordering for the remaining ones
* Possibly break up the prompting into multiple, separate logical sections? (don't know if this is kosher)
* Publish to npm

## How do I use it?

`npm install -g generator-gulp`

From within your project directory:

`yo gulp`

Simply answer the questions!

### Some notes about the choices:

#### Libsass

If you choose libsass, you can expect lightning fast compile times with a few caveats...

* @extends can be tricky, and might best be avoided
* Interpolation in attribute selectors requires some hand-waving
* Support for SASS list maps requires a [polyfill](https://github.com/lunelson)
* @import globbing isn't supported (which is [arguably not a bad thing](https://github.com/hcatlin/libsass/issues/156) [source: the article linked below])

Read [this article](http://benfrain.com/libsass-lightning-fast-sass-compiler-ready-prime-time/) for a very detailed rundown of libsass.

#### Ruby-SASS

If you choose Ruby-SASS, as your stylesheets grow in number and size so will your compile times but you'll have access to Compass, @extends, @import globbing, and full SASS 3.3 support.

### Images

#### Optimization

* gulp-imagemin
* gulp-svgo

#### Sprites

* gulp-sprite-generator
* gulp-svg-sprites
