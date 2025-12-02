// React 18 frontend for the front page

import { createRoot } from 'react-dom/client';

const FrontPage = () => {
  return <div>Front Page</div>;
};

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(<FrontPage />);