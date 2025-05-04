import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppProvider, useAppContext } from "./context/AppContext";
import { ThemeProvider } from "./context/ThemeContext";
import Layout from "./components/layout/Layout";
import Projects from "./pages/Projects";
import Timer from "./pages/Timer";
import DashboardPage from "./pages/DashboardPage";
import LoadingSpinner from "./components/common/LoadingSpinner";
import "./App.css";
import "./styles/fullscreen.css";

// Main app content with routes
const AppContent = () => {
  const { isLoading } = useAppContext();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/timer" element={<Timer />} />
        </Routes>
      </Layout>
    </Router>
  );
};

function App() {
  return (
    <AppProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AppProvider>
  );
}

export default App;
