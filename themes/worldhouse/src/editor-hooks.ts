import './hooks/core/navigation';

import styles from './css/hooks-style.css';

if(process.env.NODE_ENV === 'development') {
    styles.use();
}

if (module.hot) {
    console.log('[WorldHouse::EditorHooks] HMR enabled!');
    module.hot.accept();
}