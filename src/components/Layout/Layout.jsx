import Header from './Header';
import Footer from './Footer';
import WhatsAppButton from '../Common/WhatsAppButton';
import { Outlet } from 'react-router-dom';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Header />
      <main className="flex-grow">
        {children || <Outlet />}
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Layout;