import '../styles/globals.css';
import { CartProvider } from '../context/CartContext';
import AnnouncementBar from '../components/AnnouncementBar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';

export const metadata = {
  title: 'BIYODO Cosmetics | Maison de Beauté & Soins Botaniques en Algérie',
  description: 'Boutique en ligne officielle de soins cosmétiques haut de gamme en Algérie. Livraison express dans les 58 Wilayas et paiement à la livraison.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col bg-[#FFF9F7] text-[#343039]">
        <CartProvider>
          <AnnouncementBar />
          <Navbar />
          <CartDrawer />
          <main className="flex-grow">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
