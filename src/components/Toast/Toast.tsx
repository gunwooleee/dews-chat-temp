import { AnimatePresence, motion } from "framer-motion";

interface ToastProps {
  show: boolean;
  message: string;
}

export function Toast({ show, message }: ToastProps) {
  console.log("Toast", show, message);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2
                     rounded-xl bg-gray-800 bg-opacity-90
                     px-4 py-2 text-sm text-white shadow-lg z-10"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Toast;
