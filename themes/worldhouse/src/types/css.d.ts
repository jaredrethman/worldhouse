declare module "*.css" {
    /**
     * style-loader (injectType: "lazyStyleTag") exports an object with use/unuse.
     * We keep this loose because loader output can vary slightly by version.
     */
    const styles: {
      use: () => void;
      unuse: () => void;
    };
    export default styles;
  }
  