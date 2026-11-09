import { BrowserRouter, Routes, Route } from "react-router-dom";
import CategoriesPage from "./pages/shop/CategoriesPage";
import ShopPage from "./pages/shop/shopPage";
import HomePage from "./pages/home/HomePage";
import ProductDetailsPage from "./pages/shop/ProductDetailPage";
import CartPage from "./pages/cart/CartPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
import CheckoutPage from "./pages/cart/CheckoutPage";
import OrderCorfirmationPAge from "./pages/cart/orderConfirmationPage";
import OrderHistotyPage from "./pages/account/OrderHistoryPage";
import AddressesPage from "./pages/account/AddressPage";
import SavedItemsPage from "./pages/account/SavedItemsPages";
import AccountSettingPage from "./pages/account/AccountSettingsPage";
import OrderDetailsPage from "./pages/account/OrderDetailPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminProductsPage from "./pages/admin/AdminProductPage";
import AdminProductsFormPage from "./pages/admin/AdminProductsFormPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminCustomersPage from "./pages/admin/AdminCustomerPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoryPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import MainLayout from "./Layouts/MainLayout";
import AccountLayout from "./Layouts/AccountLayout";
import AccountOverviewPage from "./pages/account/AccountOverviewPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import NotFoundPage from "./pages/NotFoundPage";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* {Everyone can access } */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/product/:productId" element={<ProductDetailsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          {/* pages that need a login: shoppers who are not logged in are sent to login first if they try to acess the page */}

          <Route path="/Verify-email" element={<VerifyEmailPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route
            path="/Order-confirmation/:orderId"
            element={<OrderCorfirmationPAge />}
          />
          {/* Account pages: account menu on the left */}
          <Route path="/account" element={<AccountLayout />}>
            <Route index element={<AccountOverviewPage />} />
            <Route path="Orders" element={<OrderHistotyPage />} />
            <Route path="addresses" element={<AddressesPage />} />
            <Route path="saved" element={<SavedItemsPage />} />
            <Route path="settings" element={<AccountSettingPage />} />
          </Route>
          {/* Order details is full width in the design, so it has no account menu */}
          <Route
            path="/account/orders/:orderId"
            element={<OrderDetailsPage />}
          />
          {/* SDHipping returns, FAQS, About, Terms, Privacy... (one route each, all using Info page) */}
          {/* {InfoPages.map((page) => {
            <Route
              key={page.path}
              path={page.path}
              element={<InfoPages page={page} />}
            />;
          })} */}

          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="/admin/login" element={<AdminLoginPage />} />
        {/* Admin pages: admin menu + top bar, no store header or footer. */}
        <Route>
          <Route path="/admin/login" element={<AdminLoginPage />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="Products/new" element={<AdminProductsPage />} />
            <Route
              path="Products/:productId/edit"
              element={<AdminProductsFormPage />}
            />

            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />

            {/* {Anything other than admin address shows the 404 page inside the admin layout} */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
