import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './AppContext';
import EditView from './sections/EditView';
import PlayView from './sections/PlayView';

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/edit" replace />} />
        <Route path="/edit" element={<EditView />} />
        <Route path="/play" element={<PlayView />} />
      </Routes>
    </AppProvider>
  );
}
