import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { resolve, dirname } from "node:path";
import MiniCSSExtractPlugin from "mini-css-extract-plugin";

import { getBlockEntries } from "./utils.js";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

const { DEV_HOST, DEV_PORT, DEV_CERT, DEV_CERT_KEY } = process.env;
const IS_SSL = process.env.npm_lifecycle_event.includes("dev:s");

process.env.NODE_ENV ??= 'development';

export default async () => {
  const blockEntries = await getBlockEntries(
    ["style", "viewStyle", "editorStyle"],
    ["script", "viewScript", "editorScript"]
  );
  console.log({blockEntries});
  return {
    mode: "development",
    entry: {
      ...blockEntries,
      'editor-hooks': resolve(__dirname, "../src/editor-hooks.ts"),
      'view-hooks': resolve(__dirname, "../src/view-hooks.ts"),
      blocks: resolve(__dirname, "../src/blocks.ts"),
      utils: resolve(__dirname, "../src/utils.ts"),
      'front-page': resolve(__dirname, "../src/front-page/index.tsx"),
    },
    output: {
      filename: "[name].js", 
      chunkFilename: "[name].js",
      publicPath: `${IS_SSL ? "https" : "http"}://${DEV_HOST}:${DEV_PORT}/`,
      uniqueName: "worldhouse-dev",
      chunkLoadingGlobal: "wpChunkWorldhouse",
    },
    optimization: {
      runtimeChunk: "single", 
    },
    externals: {
      "@wordpress/element": ["wp", "element"],
      "@wordpress/blocks": ["wp", "blocks"],
      "@wordpress/i18n": ["wp", "i18n"],
      "@wordpress/block-editor": ["wp", "blockEditor"],
      "@wordpress/data": ["wp", "data"],
      "@wordpress/components": ["wp", "components"],
      "@wordpress/hooks": ["wp", "hooks"],
      "@wordpress/compose": ["wp", "compose"],
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
          test: /\.css$/i,
          use: [
            {
              loader: require.resolve("style-loader"),
              options: {
                injectType: "lazyStyleTag", 
                insert: require.resolve("./style-insert.cjs"),
              },
            },
            {
              loader: require.resolve("css-loader"),
              options: {
                sourceMap: true,
                importLoaders: 1,
                modules: { auto: /\.module\.css$/i },
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
                    react: {
                      runtime: "classic",
                      importSource: "@wordpress/element",
                      pragma: "wp.element.createElement",
                      pragmaFrag: "wp.element.Fragment",
                    },
                  },
                ],
              ],
              cacheDirectory: true,
            },
          },
        },
      ],
    },
    devtool: "eval-cheap-module-source-map",
    resolve: { extensions: [".ts", ".tsx", ".js", ".jsx", ".css"] },
    plugins: [
      new MiniCSSExtractPlugin({
        filename: "[name].css",
      }),
    ],
  };
};
