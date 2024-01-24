const path = require('path');
const rspack = require("@rspack/core");
const refreshPlugin = require("@rspack/plugin-react-refresh");
const isDev = process.env.NODE_ENV === "development";

/**
 * @type {import('@rspack/cli').Configuration}
 */
module.exports = {
    context: __dirname,
    entry: {
        main: "./src/main.tsx",
    },
    output: {
        assetModuleFilename: '[path][name][ext]',
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src")
        }
    },
    module: {
        rules: [
            {
                test: /\.svg$/,
                type: "asset"
            },
            {
                test: /\.(png|jpe?g|gif|webp)$/,
                type: "asset/resource"
            },
            {
                test: /\.(mp3|gltf|bin)$/,
                type: "asset/resource"
            },
            {
                test: /\.(jsx?|tsx?)$/,
                use: [
                    {
                        loader: "builtin:swc-loader",
                        options: {
                            sourceMap: true,
                            jsc: {
                                parser: {
                                    syntax: "typescript",
                                    tsx: true
                                },
                                transform: {
                                    react: {
                                        runtime: "automatic",
                                        development: isDev,
                                        refresh: isDev
                                    }
                                }
                            },
                            env: {
                                targets: [
                                    "chrome >= 87",
                                    "edge >= 88",
                                    "firefox >= 78",
                                    "safari >= 14"
                                ]
                            }
                        }
                    }
                ]
            },
            {
                test: /\.css$/,
                type: "css",
                use: [
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: {
                                    tailwindcss: {},
                                    autoprefixer: {}
                                }
                            }
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new rspack.DefinePlugin({
            "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
        }),
        new rspack.ProgressPlugin({}),
        new rspack.HtmlRspackPlugin({
            template: "./index.html",
            favicon: "./favicon.ico"
        }),
        isDev ? new refreshPlugin() : null
    ].filter(Boolean),
};
