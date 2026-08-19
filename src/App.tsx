import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { CheckoutReturnPage } from '@/pages/checkout-return-page';
import { HomePage } from '@/pages/home-page';
import { ListingPage } from '@/pages/listing-page';

/**
 * The market is public: no sign-in, no session, no guard. Anything unmatched falls back to the
 * grid rather than to a dead end.
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
        <Route path="/checkout/success" element={<CheckoutReturnPage />} />
        <Route path="/checkout/fail" element={<CheckoutReturnPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
