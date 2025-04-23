import { auth, db } from './firebase';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';

console.log('✅ Firebase Auth:', auth);
console.log('✅ Firestore DB:', db);

function App() {
  return (
    <div className="app-layout">
      <Header />
      <div className="main-content">
        <Sidebar />
        <Dashboard />
      </div>
    </div>
  );
}

export default App;
