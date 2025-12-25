import styles from './css/hooks-style.css';

if(process.env.NODE_ENV === 'development') {
    styles.use();
}

if (module.hot) {
    console.log('[WorldHouse::ViewHooks] HMR enabled!');
    module.hot.accept();
}