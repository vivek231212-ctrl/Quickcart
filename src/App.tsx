import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  ShoppingCart, 
  MapPin, 
  ChevronDown, 
  Plus, 
  Minus, 
  X, 
  ChevronRight,
  Clock,
  ArrowRight,
  User,
  Heart,
  Sparkles,
  ArrowLeft,
  CreditCard,
  Wallet,
  Truck,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GoogleGenAI } from "@google/genai";
import { Routes, Route, useNavigate, Link } from 'react-router-dom';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  stock: number;
  description: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface UserData {
  id: number;
  email: string;
  name: string;
}

// --- Components ---

const AuthPage = ({ onAuthSuccess }: { onAuthSuccess: (user: UserData) => void }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/login' : '/api/register';
    const body = isLogin ? { email, password } : { email, password, name };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        onAuthSuccess(data.user);
        navigate('/');
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12 bg-gray-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-gray-500 text-sm">
            {isLogin ? 'Login to your account to continue shopping' : 'Join FreshCart for the fastest grocery delivery'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1 ml-1">Full Name</label>
              <input 
                type="text" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#0C831F]/20 outline-none font-medium"
                placeholder="John Doe"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1 ml-1">Email Address</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#0C831F]/20 outline-none font-medium"
              placeholder="name@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1 ml-1">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#0C831F]/20 outline-none font-medium"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#0C831F] text-white py-4 rounded-2xl font-black mt-4 shadow-xl shadow-[#0C831F]/20 hover:bg-[#096b19] transition-all disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              isLogin ? 'Login' : 'Sign Up'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-bold text-[#0C831F] hover:underline"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const MyOrdersPage = ({ user }: { user: UserData | null }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/orders/user/${user?.id}`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-black mb-8">My Orders</h2>
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-white rounded-3xl border border-gray-100 animate-pulse" />
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order ID</p>
                  <p className="font-black">#FC-{order.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Date</p>
                  <p className="font-bold text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                    order.status === 'pending' ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
                  )}>
                    {order.status}
                  </span>
                </div>
                <p className="font-black text-lg">₹{order.total}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
          <Truck size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-bold mb-2">No orders yet</h3>
          <p className="text-gray-500 mb-8">You haven't placed any orders yet.</p>
          <Link to="/" className="bg-[#0C831F] text-white px-8 py-3 rounded-xl font-bold">Start Shopping</Link>
        </div>
      )}
    </div>
  );
};

const SavedAddressesPage = () => (
  <div className="max-w-4xl mx-auto px-4 py-12">
    <h2 className="text-3xl font-black mb-8">Saved Addresses</h2>
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
      <MapPin size={48} className="mx-auto mb-4 text-gray-300" />
      <h3 className="text-xl font-bold mb-2">No saved addresses</h3>
      <p className="text-gray-500">Add an address to get started with your first order.</p>
    </div>
  </div>
);

const MyPrescriptionsPage = () => (
  <div className="max-w-4xl mx-auto px-4 py-12">
    <h2 className="text-3xl font-black mb-8">My Prescriptions</h2>
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
      <Sparkles size={48} className="mx-auto mb-4 text-gray-300" />
      <h3 className="text-xl font-bold mb-2">No prescriptions found</h3>
      <p className="text-gray-500">Your uploaded prescriptions will appear here.</p>
    </div>
  </div>
);

const FAQsPage = () => (
  <div className="max-w-4xl mx-auto px-4 py-12">
    <h2 className="text-3xl font-black mb-8">Frequently Asked Questions</h2>
    <div className="space-y-4">
      {[
        { q: "How do I track my order?", a: "You can track your order in the 'My Orders' section of your account." },
        { q: "What is the delivery time?", a: "We aim to deliver most orders within 10-15 minutes." },
        { q: "Can I cancel my order?", a: "Orders can be cancelled within 1 minute of placement." }
      ].map((faq, i) => (
        <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h4 className="font-black text-lg mb-2">{faq.q}</h4>
          <p className="text-gray-600">{faq.a}</p>
        </div>
      ))}
    </div>
  </div>
);

const AccountPrivacyPage = () => (
  <div className="max-w-4xl mx-auto px-4 py-12">
    <h2 className="text-3xl font-black mb-8">Account Privacy</h2>
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
      <h3 className="text-xl font-bold mb-4">Your Privacy Matters</h3>
      <p className="text-gray-600 mb-6">We are committed to protecting your personal data and ensuring your privacy. You can manage your data preferences here.</p>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
          <span className="font-bold">Personalized Recommendations</span>
          <div className="w-12 h-6 bg-[#0C831F] rounded-full relative">
            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
          </div>
        </div>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
          <span className="font-bold">Marketing Emails</span>
          <div className="w-12 h-6 bg-gray-300 rounded-full relative">
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const AddressModal = ({ isOpen, onClose, currentAddress, onSave }: { isOpen: boolean, onClose: () => void, currentAddress: string, onSave: (addr: string) => void }) => {
  const [address, setAddress] = useState(currentAddress);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-black">Change Address</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Delivery Address</label>
            <textarea 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-[#0C831F]/20 outline-none font-medium h-32 resize-none"
              placeholder="Enter your full address..."
            />
          </div>
          
          <button 
            onClick={() => {
              onSave(address);
              onClose();
            }}
            className="w-full bg-[#0C831F] text-white py-4 rounded-2xl font-black shadow-xl shadow-[#0C831F]/20 hover:bg-[#096b19] transition-all"
          >
            Save Address
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const UserDropdown = ({ user, onLogout, onClose }: { user: UserData, onLogout: () => void, onClose: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute right-0 top-full mt-2 w-72 bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden z-50 p-6"
    >
      <div className="mb-6">
        <h3 className="text-xl font-black text-gray-800">My Account</h3>
        <p className="text-sm text-gray-500 font-medium">{user.email}</p>
      </div>

      <div className="space-y-5 mb-8">
        {[
          { label: 'My Orders', path: '/orders' },
          { label: 'Saved Addresses', path: '/addresses' },
          { label: 'My Prescriptions', path: '/prescriptions' },
          { label: "FAQ's", path: '/faqs' },
          { label: 'Account Privacy', path: '/privacy' },
        ].map((item) => (
          <Link 
            key={item.label}
            to={item.path}
            onClick={onClose}
            className="block w-full text-left text-[15px] font-medium text-gray-600 hover:text-[#0C831F] transition-colors"
          >
            {item.label}
          </Link>
        ))}
        <button 
          onClick={() => {
            onLogout();
            onClose();
          }}
          className="block w-full text-left text-[15px] font-medium text-gray-600 hover:text-red-500 transition-colors"
        >
          Log Out
        </button>
      </div>

      <div className="bg-gray-50 -mx-6 -mb-6 p-6 flex items-center gap-4">
        <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">
          <img 
            src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://blinkit.com" 
            alt="QR Code" 
            className="w-16 h-16"
          />
        </div>
        <div className="flex-1">
          <p className="text-[13px] font-black leading-tight text-gray-800">
            Simple way to get groceries <span className="text-blue-500">at your doorstep</span>
          </p>
          <p className="text-[10px] text-gray-500 mt-1 font-medium">
            Scan the QR code and download blinkit app
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const Header = ({ 
  cartCount, 
  cartTotal, 
  onCartClick, 
  searchQuery, 
  setSearchQuery,
  user,
  onLogout
}: { 
  cartCount: number, 
  cartTotal: number, 
  onCartClick: () => void,
  searchQuery: string,
  setSearchQuery: (q: string) => void,
  user: UserData | null,
  onLogout: () => void
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center gap-8">
        <Link to="/" className="flex-shrink-0">
          <h1 className="text-2xl font-black text-[#0C831F] tracking-tighter italic">FreshCart</h1>
        </Link>

        <div className="flex-1 relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={20} />
          </div>
          <input 
            type="text"
            placeholder='Search "milk", "bread" or "snacks"'
            className="w-full bg-gray-100 border-none rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-[#0C831F]/20 transition-all outline-none text-sm font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-6">
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="hidden lg:flex items-center gap-4 hover:bg-gray-50 p-2 rounded-xl transition-colors"
              >
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Welcome</span>
                  <span className="font-bold text-sm">{user.name}</span>
                </div>
                <div className="bg-gray-100 p-2 rounded-full text-gray-600">
                  <User size={20} />
                </div>
              </button>
              
              <AnimatePresence>
                {isUserMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsUserMenuOpen(false)} 
                    />
                    <UserDropdown 
                      user={user} 
                      onLogout={onLogout} 
                      onClose={() => setIsUserMenuOpen(false)} 
                    />
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/auth" className="hidden lg:flex items-center gap-2 font-bold text-sm hover:text-[#0C831F]">
              <div className="bg-gray-100 p-2 rounded-full text-gray-600">
                <User size={20} />
              </div>
              Login
            </Link>
          )}
          <button 
            onClick={onCartClick}
            className="bg-[#0C831F] text-white px-4 py-2.5 rounded-xl flex items-center gap-3 font-bold shadow-lg shadow-[#0C831F]/20 hover:bg-[#096b19] transition-colors"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 ? (
              <div className="flex flex-col items-start leading-none">
                <span className="text-xs">{cartCount} items</span>
                <span className="text-sm">₹{cartTotal}</span>
              </div>
            ) : (
              <span>My Cart</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

const HomePage = ({ 
  products, 
  loading, 
  searchQuery, 
  activeCategory, 
  setActiveCategory, 
  cart, 
  addToCart, 
  removeFromCart 
}: any) => {
  const filteredProducts = useMemo(() => {
    return products.filter((p: any) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, activeCategory]);

  const categories = ['All', ...Array.from(new Set(products.map((p: any) => p.category)))];

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Banner Section */}
      <div className="mb-12 rounded-3xl overflow-hidden relative h-64 bg-[#F8FFFB] border border-[#0C831F]/10">
        <div className="absolute inset-0 p-12 flex flex-col justify-center">
          <span className="text-[#0C831F] font-bold text-sm uppercase tracking-widest mb-2">Exclusive Offer</span>
          <h2 className="text-4xl font-black mb-4 leading-tight">Fresh Groceries<br/>Delivered in <span className="text-[#0C831F]">10 Mins</span></h2>
          <p className="text-gray-600 mb-6 max-w-md">Get up to 50% off on your first order. Use code: FRESH50</p>
          <button className="bg-black text-white px-8 py-3 rounded-full font-bold w-fit hover:scale-105 transition-transform">Shop Now</button>
        </div>
        <img 
          src="https://picsum.photos/seed/grocery/800/400" 
          alt="Banner" 
          className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-80"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Categories */}
      <div className="mb-12 overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex gap-4">
          {categories.map((cat: any) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-6 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all border",
                activeCategory === cat 
                  ? "bg-[#0C831F] text-white border-[#0C831F] shadow-md" 
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#0C831F] hover:text-[#0C831F]"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse">
              <div className="aspect-square bg-gray-100 rounded-xl mb-4" />
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          ))
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((product: any) => (
            <motion.div 
              layout
              key={product.id}
              className="group bg-white rounded-2xl p-4 border border-gray-100 hover:border-[#0C831F]/30 hover:shadow-xl hover:shadow-[#0C831F]/5 transition-all relative"
            >
              <div className="relative aspect-square mb-4 overflow-hidden rounded-xl bg-gray-50">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <button className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-400 hover:text-red-500 transition-colors">
                  <Heart size={18} />
                </button>
                <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1 text-[10px] font-bold">
                  <Clock size={10} className="text-[#0C831F]" />
                  10 MINS
                </div>
              </div>
              
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{product.category}</span>
              <h3 className="font-bold text-sm mb-1 line-clamp-2 h-10">{product.name}</h3>
              <p className="text-xs text-gray-500 mb-4">1 unit</p>
              
              <div className="flex items-center justify-between mt-auto">
                <span className="font-black text-lg">₹{product.price}</span>
                {cart.find((item: any) => item.id === product.id) ? (
                  <div className="flex items-center gap-3 bg-[#0C831F] text-white px-2 py-1.5 rounded-lg">
                    <button onClick={() => removeFromCart(product.id)}><Minus size={16}/></button>
                    <span className="font-bold text-sm">{cart.find((item: any) => item.id === product.id)?.quantity}</span>
                    <button onClick={() => addToCart(product)}><Plus size={16}/></button>
                  </div>
                ) : (
                  <button 
                    onClick={() => addToCart(product)}
                    className="border border-[#0C831F] text-[#0C831F] px-4 py-1.5 rounded-lg font-bold text-sm hover:bg-[#0C831F] hover:text-white transition-all"
                  >
                    ADD
                  </button>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">No products found</h3>
            <p className="text-gray-500">Try searching for something else</p>
          </div>
        )}
      </div>
    </main>
  );
};

const CheckoutPage = ({ cart, cartTotal, onOrderSuccess, user, address, onChangeAddress }: any) => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setIsPlacingOrder(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          items: cart,
          total: cartTotal + 2
        })
      });
      if (res.ok) {
        onOrderSuccess();
        navigate('/success');
      }
    } catch (err) {
      console.error('Order failed', err);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Link to="/" className="text-[#0C831F] font-bold">Go back to shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 mb-8 hover:text-black transition-colors">
        <ArrowLeft size={20} />
        <span className="font-bold">Back</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Delivery Address */}
          <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black flex items-center gap-2">
                <MapPin size={20} className="text-[#0C831F]" />
                Delivery Address
              </h3>
              <button onClick={onChangeAddress} className="text-[#0C831F] text-sm font-bold">CHANGE</button>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="bg-white p-2 rounded-xl shadow-sm">
                <User size={20} className="text-gray-400" />
              </div>
              <div>
                <p className="font-bold text-sm">Home</p>
                <p className="text-sm text-gray-500">{address}</p>
              </div>
            </div>
          </section>

          {/* Payment Methods */}
          <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black mb-6 flex items-center gap-2">
              <CreditCard size={20} className="text-[#0C831F]" />
              Payment Method
            </h3>
            <div className="space-y-3">
              {[
                { id: 'upi', name: 'UPI (Google Pay, PhonePe)', icon: <Sparkles size={18} /> },
                { id: 'card', name: 'Credit / Debit Card', icon: <CreditCard size={18} /> },
                { id: 'wallet', name: 'Wallets (Paytm, Mobikwik)', icon: <Wallet size={18} /> },
                { id: 'cod', name: 'Cash on Delivery', icon: <Truck size={18} /> },
              ].map(method => (
                <label 
                  key={method.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all",
                    paymentMethod === method.id ? "border-[#0C831F] bg-[#F8FFFB]" : "border-gray-100 hover:border-gray-200"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("p-2 rounded-xl", paymentMethod === method.id ? "bg-[#0C831F] text-white" : "bg-gray-100 text-gray-400")}>
                      {method.icon}
                    </div>
                    <span className="font-bold text-sm">{method.name}</span>
                  </div>
                  <input 
                    type="radio" 
                    name="payment" 
                    className="accent-[#0C831F] w-5 h-5"
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                  />
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-28">
            <h3 className="text-lg font-black mb-6">Order Summary</h3>
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
              {cart.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-gray-50" referrerPolicy="no-referrer" />
                    <div>
                      <p className="text-xs font-bold leading-tight">{item.name}</p>
                      <p className="text-[10px] text-gray-500">{item.quantity} x ₹{item.price}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Items Total</span>
                <span>₹{cartTotal}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Delivery Charge</span>
                <span className="text-[#0C831F] font-bold">FREE</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Handling Charge</span>
                <span>₹2</span>
              </div>
              <div className="flex justify-between font-black text-xl pt-2">
                <span>To Pay</span>
                <span>₹{cartTotal + 2}</span>
              </div>
            </div>

            <button 
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
              className="w-full bg-[#0C831F] text-white py-4 rounded-2xl font-black mt-8 shadow-xl shadow-[#0C831F]/20 hover:bg-[#096b19] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPlacingOrder ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Place Order
                  <ChevronRight size={20} />
                </>
              )}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

const SuccessPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 12, stiffness: 200 }}
        className="bg-[#0C831F]/10 p-8 rounded-full mb-8"
      >
        <CheckCircle2 size={80} className="text-[#0C831F]" />
      </motion.div>
      <h2 className="text-4xl font-black mb-4">Order Placed Successfully!</h2>
      <p className="text-gray-500 mb-12 max-w-md">Your groceries are being packed and will be delivered to your doorstep in 10 minutes.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl mb-12">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <Clock className="mx-auto mb-3 text-[#0C831F]" />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Estimated Time</p>
          <p className="font-black">10 Mins</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <MapPin className="mx-auto mb-3 text-[#0C831F]" />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Delivering to</p>
          <p className="font-black">Home</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <Truck className="mx-auto mb-3 text-[#0C831F]" />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order ID</p>
          <p className="font-black">#FC-{Math.floor(Math.random() * 90000) + 10000}</p>
        </div>
      </div>

      <Link 
        to="/" 
        className="bg-[#0C831F] text-white px-12 py-4 rounded-2xl font-black shadow-xl shadow-[#0C831F]/20 hover:bg-[#096b19] transition-all"
      >
        Continue Shopping
      </Link>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [address, setAddress] = useState('Flat No. 402, Green Valley Apartments, Sector 45, Gurgaon, Haryana - 122003');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleAuthSuccess = (userData: UserData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/');
  };

  useEffect(() => {
    if (cart.length > 0) {
      getAiRecommendations();
    } else {
      setAiRecommendations([]);
    }
  }, [cart]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  const getAiRecommendations = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const cartItems = cart.map(item => item.name).join(', ');
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Based on these grocery items in the cart: [${cartItems}], suggest 3 complementary items that a user might want to buy. Return only a comma-separated list of item names.`,
      });
      const suggestions = response.text?.split(',').map(s => s.trim()) || [];
      setAiRecommendations(suggestions);
    } catch (err) {
      console.error('AI Recommendation failed', err);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map(item => 
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prev.filter(item => item.id !== productId);
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Header 
        cartCount={cartCount} 
        cartTotal={cartTotal} 
        onCartClick={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        user={user}
        onLogout={handleLogout}
      />

      <Routes>
        <Route path="/" element={
          <HomePage 
            products={products}
            loading={loading}
            searchQuery={searchQuery}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            cart={cart}
            addToCart={addToCart}
            removeFromCart={removeFromCart}
          />
        } />
        <Route path="/auth" element={<AuthPage onAuthSuccess={handleAuthSuccess} />} />
        <Route path="/orders" element={<MyOrdersPage user={user} />} />
        <Route path="/addresses" element={<SavedAddressesPage />} />
        <Route path="/prescriptions" element={<MyPrescriptionsPage />} />
        <Route path="/faqs" element={<FAQsPage />} />
        <Route path="/privacy" element={<AccountPrivacyPage />} />
        <Route path="/checkout" element={
          <CheckoutPage 
            cart={cart} 
            cartTotal={cartTotal} 
            onOrderSuccess={() => setCart([])}
            user={user}
            address={address}
            onChangeAddress={() => setIsAddressModalOpen(true)}
          />
        } />
        <Route path="/success" element={<SuccessPage />} />
      </Routes>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-black">My Cart</h2>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {cart.length > 0 ? (
                  <>
                    <div className="bg-[#F8FFFB] border border-[#0C831F]/10 p-4 rounded-2xl flex items-center gap-4">
                      <div className="bg-[#0C831F]/10 p-2 rounded-full">
                        <Clock size={20} className="text-[#0C831F]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Delivery in 10 minutes</p>
                        <p className="text-xs text-gray-500">Shipment 1 of 1</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {cart.map(item => (
                        <div key={item.id} className="flex gap-4 items-center">
                          <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover bg-gray-50" referrerPolicy="no-referrer" />
                          <div className="flex-1">
                            <h4 className="font-bold text-sm leading-tight">{item.name}</h4>
                            <p className="text-xs text-gray-500">1 unit</p>
                            <p className="font-black text-sm mt-1">₹{item.price}</p>
                          </div>
                          <div className="flex items-center gap-3 bg-[#0C831F] text-white px-2 py-1.5 rounded-lg">
                            <button onClick={() => removeFromCart(item.id)}><Minus size={14}/></button>
                            <span className="font-bold text-xs">{item.quantity}</span>
                            <button onClick={() => addToCart(item)}><Plus size={14}/></button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* AI Recommendations */}
                    {aiRecommendations.length > 0 && (
                      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-2xl border border-purple-100">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles size={16} className="text-purple-600" />
                          <h4 className="text-xs font-black text-purple-900 uppercase tracking-wider">AI Suggestions</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {aiRecommendations.map((rec, i) => (
                            <button 
                              key={i}
                              onClick={() => {
                                setSearchQuery(rec);
                                setIsCartOpen(false);
                              }}
                              className="bg-white px-3 py-1.5 rounded-full text-[10px] font-bold text-purple-700 border border-purple-200 hover:bg-purple-600 hover:text-white transition-all"
                            >
                              + {rec}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-6 border-t border-gray-100 space-y-3">
                      <h4 className="font-bold text-sm">Bill Details</h4>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Items Total</span>
                        <span>₹{cartTotal}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Delivery Charge</span>
                        <span className="text-[#0C831F] font-bold">FREE</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Handling Charge</span>
                        <span>₹2</span>
                      </div>
                      <div className="flex justify-between font-black text-lg pt-2">
                        <span>Grand Total</span>
                        <span>₹{cartTotal + 2}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mb-6">
                      <ShoppingCart size={40} className="text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Your cart is empty</h3>
                    <p className="text-gray-500 mb-8">Start adding items to your cart to see them here.</p>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="bg-[#0C831F] text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
                    >
                      Browse Products
                    </button>
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin size={18} className="text-[#0C831F]" />
                      <div className="text-xs flex-1">
                        <p className="font-bold">Delivering to Home</p>
                        <p className="text-gray-500 truncate w-40">{address}</p>
                      </div>
                    </div>
                    <button onClick={() => setIsAddressModalOpen(true)} className="text-[#0C831F] text-xs font-bold">CHANGE</button>
                  </div>
                  <button 
                    onClick={() => {
                      setIsCartOpen(false);
                      navigate('/checkout');
                    }}
                    className="w-full bg-[#0C831F] text-white py-4 rounded-2xl font-black flex items-center justify-between px-6 shadow-xl shadow-[#0C831F]/20 hover:bg-[#096b19] transition-all group"
                  >
                    <div className="flex flex-col items-start leading-none">
                      <span className="text-sm">₹{cartTotal + 2}</span>
                      <span className="text-[10px] opacity-80 uppercase tracking-widest">Total</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Proceed to Pay</span>
                      <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AddressModal 
        isOpen={isAddressModalOpen} 
        onClose={() => setIsAddressModalOpen(false)} 
        currentAddress={address}
        onSave={(newAddr) => setAddress(newAddr)}
      />

      {/* Fixed Bottom Bar (Mobile) */}
      {cartCount > 0 && !isCartOpen && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-6 left-4 right-4 z-40 lg:hidden"
        >
          <button 
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-[#0C831F] text-white p-4 rounded-2xl flex items-center justify-between shadow-2xl shadow-[#0C831F]/40"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <ShoppingCart size={20} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold">{cartCount} Items</p>
                <p className="text-xs opacity-80">₹{cartTotal}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 font-bold">
              <span>View Cart</span>
              <ArrowRight size={18} />
            </div>
          </button>
        </motion.div>
      )}
    </div>
  );
}
