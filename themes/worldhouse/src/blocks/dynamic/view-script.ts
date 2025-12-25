// View Script
import styles from './view-style.css';

if(process.env.NODE_ENV === 'development') {
  styles.use();
}

console.log('[WorldHouse::Block:Dynamic] view-script.ts loaded!');

if (module.hot) {
  console.log('[WorldHouse::Block:Dynamic] view-script.ts HMR enabled!');
  module.hot.accept();
}