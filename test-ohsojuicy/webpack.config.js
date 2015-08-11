var juicy = require("ohsojuicy");
module.exports = {
    entry: "./main.oj",
    output: {
        filename: "app.js",
        path: "./build"
    },
    resolve: {
        extensions: ["",".js",".json",".oj"],
    },
    module: {
        loaders: [
            {test: /\.oj$/, loader: require.resolve("../")}
        ]
    },
    oj: {
        pre: [juicy.preprocessor()],
        options: {
            preprocessor: {
                include_path: [__dirname],
                defines: {
                    APP: JSON.stringify("Testing")
                }
            }
        }
    }
}
