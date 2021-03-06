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
    }
}
