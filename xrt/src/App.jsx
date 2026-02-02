import "./App.css";
import Header from "./Component/Layout/Header.jsx";
import Footer from "./Component/Footer/FooterSection.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import AdsPopup from "./Component/Ads/AdsPopup.jsx";

function App() {
  return (
    <CartProvider>
      <AdsPopup />
      <Header />
      <AppRoutes />
      <Footer/>
    </CartProvider>
  );
}

export default App;
