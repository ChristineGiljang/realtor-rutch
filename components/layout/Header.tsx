import TopBar from "@/components/layout/TopBar";
import Navbar from "@/components/layout/Navbar";

export default function Header() {
  return (
    <header className="fixed top-0 w-full z-50">
      <TopBar />
      <Navbar />
    </header>
  );
}
