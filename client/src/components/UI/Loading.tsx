export default function Loading() {
  return (
    <div className="flex items-center justify-center py-1.5 space-x-1">
      <div
        className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
        style={{ animationDelay: "-0.32s" }}
      ></div>
      <div
        className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
        style={{ animationDelay: "-0.16s" }}
      ></div>
      <div
        className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
        style={{ animationDelay: "0s" }}
      ></div>
    </div>
  );
}
