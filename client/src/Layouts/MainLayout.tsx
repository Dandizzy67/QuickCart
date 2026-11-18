import { Outlet } from "react-router-dom";
import NavBar from "../components/layout/NavBar";
import Footer from "../components/layout/footer";
import AddedToCartModal from "../components/product/AddedToCartModal";
import ScrollToTop from "../components/layout/ScrollToTop";
const MainLayout = () => {
  return (
    <>
      <NavBar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <AddedToCartModal />
      <ScrollToTop />
    </>
  );
};

export default MainLayout;
