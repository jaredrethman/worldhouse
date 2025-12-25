// Editor + View Script
import styles from "./global-style.css";

if(process.env.NODE_ENV === 'development') {
    styles.use();
}

console.log('[WorldHouse::Block:Dynamic] global-script.js loaded!');

if (module.hot) {
  module.hot.accept(["./global-script"], () => {
    console.log('[WorldHouse::Block:Dynamic] global-script.js HMR triggered!');
    require("./global-script").default;
  });
}