module.exports = {
    module: {
        rules: [
            {
                test: /\.graphql$/,
                exclude: /node_modules/,
                loader: "graphql-tag/loader",
            },
        ],
    },
};
