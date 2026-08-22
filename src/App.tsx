import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { CheckoutReturnPage } from '@/pages/checkout-return-page';
import { HomePage } from '@/pages/home-page';
import { ListingPage } from '@/pages/listing-page';
import { LoginPage } from '@/pages/login-page';
import { ProfilePage } from '@/pages/profile-page';
import { RegisterPage } from '@/pages/register-page';

/**
 * The market itself is public: browsing and ordering need no account, so there is no guard on the
 * grid or on a listing. Sign-in exists for the other side of it — registering as a seller, and
 * being recognised afterwards. Anything unmatched falls back to the grid rather than to a dead end.
 *
 * Both checkout endings render the same page on purpose. Which address the bank sent the buyer to
 * is not evidence of anything — that page asks the server what the order actually says.
 */
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/listing/:id" element={<ListingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/checkout/success" element={<CheckoutReturnPage />} />
        <Route path="/checkout/fail" element={<CheckoutReturnPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
