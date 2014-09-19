
### Libsass

If you choose libsass, you can expect lightning fast compile times with a few caveats...

* @extends can be tricky, and might best be avoided
* Interpolation in attribute selectors requires some hand-waving
* Support for SASS list maps requires a [polyfill](https://github.com/lunelson)
* @import globbing isn't supported (which is [arguably not a bad thing](https://github.com/hcatlin/libsass/issues/156) [source: the article linked below])

Read [this article](http://benfrain.com/libsass-lightning-fast-sass-compiler-ready-prime-time/) for a very detailed rundown of libsass.

#### Ruby-SASS

If you choose Ruby-SASS, as your stylesheets grow in number and size so will your compile times but you'll have access to Compass, @extends, @import globbing, and full SASS 3.3 support.



## Images

### Optimization

* gulp-imagemin
* gulp-svgo

### Sprites

* gulp-sprite-generator
* gulp-svg-sprites
