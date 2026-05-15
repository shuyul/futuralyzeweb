import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Blog } from "./pages/Blog";
import { BlogPost } from "./pages/BlogPost";
import { Agents } from "./pages/Agents";
import { Gallery } from "./pages/Gallery";
import { Resources } from "./pages/Resources";
import { Trending } from "./pages/Trending";
import { Admin } from "./pages/Admin";
import { NotFound } from "./pages/NotFound";
import { SplashScreen } from "./pages/SplashScreen";
import { SplashScreenDemo } from "./pages/SplashScreenDemo";
import { HomeV2 } from "./pages/HomeV2";
import { HomeV3 } from "./pages/HomeV3";

export const router = createBrowserRouter([
  // 工具感首页（alexanderobenauer.com风格）- 根路径
  {
    path: "/",
    element: <HomeV3 />,
  },
  // 书籍式首页 - 保留用于对比
  {
    path: "/home-v2",
    element: <HomeV2 />,
  },
  // 旧版首页（杂志式）- 保留用于对比
  {
    path: "/home-old",
    element: <Home />,
  },
  // 启动页（独立路由，用于测试）
  {
    path: "/splash",
    element: <SplashScreen />,
  },
  // 启动页演示版（纯代码，立即可看）
  {
    path: "/splash-demo",
    element: <SplashScreenDemo />,
  },
  // 其他页面（带导航布局）
  {
    element: <Layout />,
    children: [
      { path: "blog", element: <Blog /> },
      { path: "blog/:id", element: <BlogPost /> },
      { path: "agents", element: <Agents /> },
      { path: "gallery", element: <Gallery /> },
      { path: "resources", element: <Resources /> },
      { path: "trending", element: <Trending /> },
      { path: "admin", element: <Admin /> },
    ],
  },
  // 404
  {
    path: "*",
    element: <NotFound />,
  },
]);
