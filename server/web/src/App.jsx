import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ContentTree from './pages/ContentTree';
import DocViewer from './pages/DocViewer';
import Search from './pages/Search';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/content" element={<ContentTree />} />
        <Route path="/search" element={<Search />} />
        <Route path="/doc/:author/:name" element={<DocViewer />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
