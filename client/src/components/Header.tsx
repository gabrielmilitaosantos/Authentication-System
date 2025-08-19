import { assets } from "../assets/assets";
import { useAppContext } from "../hooks/useAppContext";

const STYLES = {
  container: "flex flex-col items-center mt-20 px-4 text-center text-gray-800",
  image: "w-36 h-36 rounded-full mb-6",
  title: "flex items-center gap-2 text-xl sm:text-3xl font-medium mb-2",
  icon: "w-8 aspect-square",
  subtitle: "text-3xl sm:text-5xl font-semibold mb-4",
  submit:
    "border border-gray-500 rounded-full px-8 py-3 hover:bg-gray-100 transition-all cursor-pointer",
} as const;

export default function Header() {
  const { userData, isLogin } = useAppContext();
  return (
    <div className={STYLES.container}>
      <img src={assets.header_img} alt="Robot-Icon" className={STYLES.image} />

      <h1 className={STYLES.title}>
        Hey {isLogin ? userData?.name : "Developer"}!
        <img src={assets.hand_wave} alt="Hand-Icon" className={STYLES.icon} />
      </h1>

      <h2 className={STYLES.subtitle}>Welcome to my app</h2>
      <button className={STYLES.submit}>Get Started</button>
    </div>
  );
}
