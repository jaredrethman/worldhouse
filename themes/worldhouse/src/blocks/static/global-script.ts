// Editor + View Script
import styles from "./global-style.css";

if(process.env.NODE_ENV === 'development') {
    styles.use();
}

console.log('[WorldHouse::Block:Static] global-script.js loaded!');

if (module.hot) {
  module.hot.accept();
}