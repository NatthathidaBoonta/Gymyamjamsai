import './styles/theme.css';
import AppRouter from './routes/AppRouter';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <>
      <ScrollToTop />
      <AppRouter />
    </>
  );
}

export default App;
