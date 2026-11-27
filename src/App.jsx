import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout.jsx';

// Páginas carregadas sob demanda (code splitting): cada rota vira um arquivo .js
// separado no build, e o navegador só baixa a página quando ela é acessada.
const Home = lazy(() => import('./pages/Home/Home.jsx'));
const About = lazy(() => import('./pages/About/About.jsx'));
const SerieRegister = lazy(() => import('./pages/SerieRegister/SerieRegister.jsx'));
const SerieListPage = lazy(() => import('./pages/SerieListPage/SerieListPage.jsx'));
const EditSerie = lazy(() => import('./pages/EditSerie/EditSerie.jsx'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound.jsx'));

// Rotas da aplicação. Todas ficam dentro do Layout (NavBar + card central),
// que também mostra um indicador de carregamento enquanto a página é baixada.
// Os dados vêm da API em cada página, via src/services.
function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/sobre" element={<About />} />
        <Route path="/cadastrar" element={<SerieRegister />} />
        <Route path="/series" element={<SerieListPage />} />
        <Route path="/editar/:id" element={<EditSerie />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
