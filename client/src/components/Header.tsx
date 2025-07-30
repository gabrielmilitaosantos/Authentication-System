import { assets } from "../assets/assets";

export default function Header() {
  return (
    <div className="flex flex-col items-center mt-20 px-4 text-center text-gray-800">
      <img
        src={assets.header_img}
        alt="Robot-Icon"
        className="w-36 h-36 rounded-full mb-6"
      />

      <h1 className="flex items-center gap-2 text-xl sm:text-3xl font-medium mb-2">
        Hey Developer{" "}
        <img
          src={assets.hand_wave}
          alt="Hand-Icon"
          className="w-8 aspect-square"
        />
      </h1>

      <h2 className="text-3xl sm:text-5xl font-semibold mb-4">
        Welcome to my app
      </h2>
      <button className="border border-gray-500 rounded-full px-8 py-3 hover:bg-gray-100 transition-all cursor-pointer">
        Get Started
      </button>
    </div>
  );
}
