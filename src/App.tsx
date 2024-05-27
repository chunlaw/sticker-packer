import { Outlet, Route, Routes } from "react-router-dom";
import Layout from "./components/layouts/Layout";
import DashboardPage from "./pages/DashboardPage";
import PackPage from "./pages/PackPage";
import StickerPage from "./pages/StickerPage";
import { EditorContextProvider } from "./context/EditorContext";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route
          path=":packId"
          element={
            <EditorContextProvider>
              <Outlet />
            </EditorContextProvider>
          }
        >
          <Route path=":stickerId" element={<StickerPage />} />
          <Route index element={<PackPage />} />
        </Route>
        <Route index element={<DashboardPage />} />
      </Route>
    </Routes>
  );
}

export default App;
