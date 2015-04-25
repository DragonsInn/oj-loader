# The OJ loader for [WebPack](https://github.com/webpack/webpack) - An objective foresight!

Have you seen `objective-j` before - or are you a fan of the ObjC language itself? Or are you just looking for somethign that can make your code quite unique on its own? Maybe OJ is something for you then!

The OJ loader transforms your OJ scripts (`.oj`) into pure JavaScript, supporting SourceMaps and other cool features!

You can learn more about OJ at it's [GitHub repository](https://github.com/musictheory/oj)!


## Get it!
Very easy:

    npm install oj-loader


## Usage
Just like any other loader, you will have to tell WebPac to load `.oj` files using this loader. You have to know, though, that this loader **injects a runtime**. That means, it will add an additional file into the pack. If you are using a code obfuscator, make sure to whitelist `$oj_oj`. Read more on OJ's README.

### Configuration
```javascript
module.exports = {
    entry: "<your entry file>",
    output: {
        path: __dirname,
        filename: "app.js"
    }
    module: {
        loaders: [
            { test: /\.oj$/, loader: "oj" }
        ]
    }
}
```

Usually, you'd supply something like `myapp.js` into the `entry` section of the configuration. But if you have the OJ loader installed, you can **also** use a `.oj` file as an entry!


### Your first OJ script (`bard.oj`)
```objective-c
@implementation Bard {}
+(void)tellAStoryAbout:(string)name at:(string)at {
    alert("This is a story about "+name+" who lives at "+at+"!");
}
@end
```

Now we have a very tiny and basic class. In order to use it, we do it like this:

### Entry (`main.oj`)
```objective-c
require("bard.oj"); // Looking familiar?

// In order to use the Bard class, we have to tell the compiler about it:
@class Bard;

// Now to invoke it's story method.
[Bard tellAStoryAbout:"Foo" at:"Bazland"];
```

Although the compiler will keep it's state saved across files, **you should use `@class`**. Only leave it out if you know what you are doing.

If you now used `main.oj` and `bard.oj` in the same folder, and webpack'ed them together, then you would be able to see your result containing the compiled result of the files, plus the OJ runtime. Running this in your browser will result in a new alert with the story. :)

By the way, OJ works in the browser and NodeJS.


## Supported WebPack features
- Mimimize: When WebPack is in mimimize mode, OJ's squeeze method is applied, effectively shrinking idendifier names. I.e. `$oj_c_Bard` becomes `$oj$a`. This works very well with WebPack's builtin UglifyJS!
- SourceMap: When enabled, this loader tries to emit a SourceMap. Though, this seems to not work as expected. The map is returned properly, but WebPack prints "null" to the output.
- Cacheable: The output can be cached easily.

If there are more cool features I didn't notice yet, let me know!


## Learn more!
The above example is ultra simple and does not use the TypeChecker. So you don't even need to specify type names as you'd usually do in Objective-C. But the TypeChecker is target to be implemented ASAP.

To learn more about OJ, visit it's [GitHub repository](https://github.com/musictheory/oj).


## License
MIT
