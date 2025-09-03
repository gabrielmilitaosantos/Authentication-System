import Header from "../components/Home/Header";
import Navbar from "../components/Home/Navbar";

const homeClass =
  "flex flex-col items-center justify-center min-h-screen bg-[url('/bg_img.png')] bg-cover bg-center";

export default function Home() {
  return (
    <div className={homeClass}>
      <Navbar />
      <Header />
    </div>
  );
}
