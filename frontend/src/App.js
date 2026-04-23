import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import { LoginPage, SignUpPage } from "./components/auth/AuthPages";
import Dashboard from "./components/Dashboard";
import TransactionForm from "./components/TransactionForm";
import Budgeting from "./components/Budgeting";
import DetailTransaksi from "./components/DetailTransaksi";
import Prediction from "./components/Prediction";
import PredictionHistory from "./components/PredictionHistory";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="transaksi" element={<TransactionForm />} />
            <Route path="budgeting" element={<Budgeting />} />
            <Route path="detail" element={<DetailTransaksi />} />
            <Route path="prediksi" element={<Prediction />} />
            <Route path="history" element={<PredictionHistory />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
