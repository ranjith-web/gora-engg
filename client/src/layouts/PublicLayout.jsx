import { Outlet } from "react-router-dom";
import Nav from "../features/site/components/Nav";
import Footer from "../features/site/components/Footer";

export default function PublicLayout() {
  return (
    <div id="top" className="min-h-screen bg-paper font-body text-ink">
      <Nav />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
