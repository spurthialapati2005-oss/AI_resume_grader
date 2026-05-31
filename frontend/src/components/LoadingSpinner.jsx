import { motion } from "framer-motion";

export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-white/50 backdrop-blur-sm">
      <motion.div
        className="h-14 w-14 rounded-full border-4 border-gray-200 border-t-gray-950"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
