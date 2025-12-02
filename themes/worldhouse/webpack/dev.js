import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import { createRequire } from "node:module";
import { getBlockEntries } from "./utils.js";
import MiniCSSExtractPlugin from "mini-css-extract-plugin";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

const { DEV_HOST, DEV_PORT, DEV_CERT, DEV_CERT_KEY } = process.env;
const IS_SSL = process.env.npm_lifecycle_event.includes("dev:s");

export default async () => {
  const blockEntries = await getBlockEntries([
    "style",
    "viewStyle",
    "editorStyle",
  ]);
  return {
    mode: "development",
    entry: {
      ...blockEntries,
      utils: resolve(__dirname, "../src/utils.ts"),
      blocks: resolve(__dirname, "../src/blocks.ts"),
      'front-page': resolve(__dirname, "../src/front-page.tsx"),
    },
    output: {
      filename: "[name].js", // -> blocks/.../index.js
      chunkFilename: "[name].js",
      publicPath: `${IS_SSL ? "https" : "http"}://${DEV_HOST}:${DEV_PORT}/`,
      uniqueName: "worldhouse-dev", // avoid collisions with other bundles
      chunkLoadingGlobal: "wpChunkSketchdeck",
    },
    optimization: {
      runtimeChunk: "single", // Share HMR runtime between entries
    },
    externals: {
      "@wordpress/element": ["wp", "element"],
      "@wordpress/blocks": ["wp", "blocks"],
      "@wordpress/i18n": ["wp", "i18n"],
      "@wordpress/block-editor": ["wp", "blockEditor"],
      "@wordpress/data": ["wp", "data"],
      "@wordpress/components": ["wp", "components"],
    },
    devServer: {
      host: "0.0.0.0",
      port: DEV_PORT,
      hot: true,
      liveReload: false,
      allowedHosts: [DEV_HOST],
      headers: { "Access-Control-Allow-Origin": "*" },
      server: {
        type: IS_SSL ? "https" : "http",
        options: {
          cert: IS_SSL ? DEV_CERT : undefined,
          key: IS_SSL ? DEV_CERT_KEY : undefined,
        },
      },
      client: {
        overlay: true,
        webSocketURL: {
          protocol: IS_SSL ? "wss" : "ws",
          hostname: DEV_HOST,
          port: DEV_PORT,
          pathname: "/ws",
        },
      },
    },
    module: {
      rules: [
        // dev CSS: inject for HMR
        {
          test: /\.css$/,
          use: [
            {
              loader: require.resolve("style-loader"),
            },
            {
              loader: require.resolve("css-loader"),
              options: {
                importLoaders: 1,
                sourceMap: true,
                modules: {
                  auto: true,
                },
              },
            },
          ],
        },
        {
          test: /\.[jt]sx?$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: [
                [
                  require.resolve("@wordpress/babel-preset-default"),
                  {
                    // Force classic JSX using wp.element
                    react: {
                      runtime: "classic",
                      importSource: "@wordpress/element",
                      pragma: "wp.element.createElement",
                      pragmaFrag: "wp.element.Fragment",
                    },
                  },
                ],
              ],
              plugins: [require.resolve("react-refresh/babel")],
              cacheDirectory: true,
            },
          },
        },
      ],
    },
    devtool: "eval-cheap-module-source-map",
    resolve: { extensions: [".ts", ".tsx", ".js", ".jsx", ".css"] },
    plugins: [
      new ReactRefreshWebpackPlugin({
        overlay: false,
        // Exclude CSS files and CSS loader runtime modules
        exclude: [
          /blocks\/.*\/edit\.(tsx?|jsx?)$/,
          /\.css$/,
          /css-loader/,
          /mini-css-extract-plugin/,
        ],
      }),
      new MiniCSSExtractPlugin({
        filename: "[name].css",
      }),
    ],
  };
};
