// @ts-nocheck

/* eslint-disable react-hooks/static-components */
import { lazy, Suspense } from 'react'
import { Toaster } from 'react-hot-toast'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import Layout from './components/common/Layout'
import { Analytics } from "@vercel/analytics/react"
import WhatsappFloat from './components/common/WhatsappFloat'

// Lazy loaded components
const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'))
const CustomerHome = lazy(() => import('./pages/customer/CustomerHome'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const StaffDashboard = lazy(() => import('./pages/staff/StaffDashboard'))
const Products = lazy(() => import('./pages/admin/Products'))
const AddProduct = lazy(() => import('./pages/admin/AddProduct'))
const EditProduct = lazy(() => import('./pages/admin/EditProducts'))
const Shop = lazy(() => import('./pages/customer/Shop'))
const ProductDetailPage = lazy(() => import('./pages/customer/ProductDetailPage'))
const Cart = lazy(() => import('./pages/customer/Cart'))
const Checkout = lazy(() => import('./pages/customer/Checkout'))
const OrderDetail = lazy(() => import('./pages/admin/OrderDetail'))
const Orders = lazy(() => import('./pages/admin/Orders'))
const MyOrders = lazy(() => import('./pages/customer/MyOrders'))
const OrderTracking = lazy(() => import('./pages/customer/OrderTracking'))
const StaffOrders = lazy(() => import('./pages/staff/StaffOrders'))
const StaffPos = lazy(() => import('./pages/staff/StaffPos'))
const Customer = lazy(() => import('./pages/admin/Customer'))
const LandingPage = lazy(() => import('./pages/customer/LandingPage'))
const About = lazy(() => import('./pages/customer/About'))
const Staff = lazy(() => import('./pages/admin/Staff'))
const PromoCodes = lazy(() => import('./pages/admin/PromoCodes'))
const Analytics2 = lazy(() => import('./pages/admin/Analytics'))
const Settings = lazy(() => import('./pages/admin/Settings'))
const Profile = lazy(() => import('./pages/customer/Profile'))
const Reviews = lazy(() => import('./pages/admin/Reviews'))
const FlashSales = lazy(() => import('./pages/admin/FlashSales'))


// function Home() { return <h1 className="p-8 text-2xl font-bold text-primary">🏠 Customer Home</h1> }
// function AdminHome() { return <h1 className="p-8 text-2xl font-bold text-primary">👑 Admin Dashboard</h1> }
// function StaffHome() { return <h1 className="p-8 text-2xl font-bold text-primary">👨‍💼 Staff Dashboard</h1> }

const App = () => {
  const { user, profile } = useAuth()

  const RedirectIfLoggedIn = ({ children }) => {
    if (user) {
      if (profile?.role === 'super_admin') return <Navigate to='/admin' replace />
      if (profile?.role === 'admin') return <Navigate to='/admin' replace />
      if (profile?.role === 'staff') return <Navigate to='/staff' replace />
      return <Navigate to='/' replace />
    }
    return children
  }

  return (
    <>
      <Toaster position="top-right" />
      <Suspense fallback={
        <div className="h-screen w-full flex items-center justify-center bg-neutral-light">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      }>
        <Routes>
        <Route path="/about" element={<Layout><About /></Layout>} />
        <Route path="/login" element={<RedirectIfLoggedIn><Login /></RedirectIfLoggedIn>} />
        <Route path="/register" element={<RedirectIfLoggedIn><Register /></RedirectIfLoggedIn>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/" element={user ?
          <ProtectedRoute allowedRoles={['customer']}>
            <Layout>
              <CustomerHome />
            </Layout>
          </ProtectedRoute> : <Layout><LandingPage /></Layout>
        } />

        <Route path="/shop" element={
          // <ProtectedRoute allowedRoles={['customer']}>
            <Layout> <Shop /> </Layout>
          // </ProtectedRoute>
        } />

        <Route path="/shop/:slug" element={
          // <ProtectedRoute allowedRoles={['customer']}>
            <Layout>
              <ProductDetailPage />
            </Layout>
          // </ProtectedRoute>
        } />

        <Route path="/cart" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <Cart />
          </ProtectedRoute>
        } />

        <Route path="/checkout" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <Checkout />
          </ProtectedRoute>
        } />

        <Route path="/orders" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <MyOrders />
          </ProtectedRoute>
        } />

        <Route path="/orders/:id" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <OrderTracking />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <Profile />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/admin/products" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
            <Products />
          </ProtectedRoute>
        } />

        <Route path="/admin/orders" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
            <Orders />
          </ProtectedRoute>
        } />

        <Route path="/admin/orders/:id" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
            <OrderDetail />
          </ProtectedRoute>
        } />
        <Route path="/admin/customers" element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <Customer />
          </ProtectedRoute>
        } />
        <Route path="/admin/analytics" element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <Analytics2 />
          </ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/admin/promos" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
            <PromoCodes />
          </ProtectedRoute>
        } />
        <Route path="/admin/reviews" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
            <Reviews />
          </ProtectedRoute>
        } />
        <Route path="/admin/flash-sales" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
            <FlashSales />
          </ProtectedRoute>
        } />
        <Route path="/admin/staff" element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <Staff />
          </ProtectedRoute>
        } />

        <Route path="/admin/products/add" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
            <AddProduct />
          </ProtectedRoute>
        } />

        <Route path="/admin/products/edit/:id" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
            <EditProduct />
          </ProtectedRoute>
        } />

        {/* Staff */}
        <Route path="/staff" element={
          <ProtectedRoute allowedRoles={['staff']}>
            <StaffDashboard />
          </ProtectedRoute>
        } />

        <Route path='/staff/orders' element={
          <ProtectedRoute allowedRoles={['staff']}>
            <StaffOrders />
          </ProtectedRoute>
        } />
        <Route path='/staff/pos' element={
          <ProtectedRoute allowedRoles={['staff']}>
            <StaffPos />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <WhatsappFloat />
      <Analytics />
    </>
  )
}

export default App
