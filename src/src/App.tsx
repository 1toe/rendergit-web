import { ThemeProvider } from './services/themeService';
import { AppProvider } from './services/appStateService';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Content from './components/Content';
import './App.css';

function App(): JSX.Element {
  return (
    <ThemeProvider>
      <AppProvider>
        <div className="app">
          <Header />
          <div className="main-layout">
            <Sidebar />
            <Content />
          </div>
        </div>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
