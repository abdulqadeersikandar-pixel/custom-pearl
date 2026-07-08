import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar         from './components/Navbar';
import Home           from './pages/Home';
import Shop           from './pages/Shop';
import AdminDashboard from './pages/AdminDashboard';
import Login          from './pages/login';
import ProtectedRoute from './components/ProtectedRoute';
import Cart           from './pages/cart';
import Checkout       from './pages/Checkout';
import TrackOrder     from './pages/TrackOrder';
import MyOrders       from './pages/MyOrders';
import { CartProvider }  from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { OrderProvider } from './context/OrderContext';
import ChatBot        from './components/ChatBot';
function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <OrderProvider>
          <Router>
            <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
              <Navbar />
              <Routes>
                <Route path="/"         element={<Home />} />
                <Route path="/shop"     element={<Shop />} />
                <Route path="/login"    element={<Login />} />
                <Route path="/cart"     element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                
                {/* Track Order ke dono paths add kar diye hain taake page crash na ho */}
                <Route path="/track"       element={<TrackOrder />} />
                <Route path="/track-order" element={<TrackOrder />} />
                
                <Route path="/my-orders"   element={<MyOrders />} />
                <Route path="/admin"       element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              </Routes>
              <ChatBot />
            </div>
          </Router>
        </OrderProvider>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;