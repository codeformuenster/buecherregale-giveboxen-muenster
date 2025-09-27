import { motion } from "motion/react";

export function Sheet({
  children,
  show,
}: {
  children: React.ReactNode;
  show: boolean;
}) {
  return (
    <div className="inset-1 absolute flex flex-col">
      <div className="flex-1"></div>
      <motion.div
        className="pointer-events-auto h-[65vh] w-full bg-white/80 filter backdrop-blur-lg backdrop-saturate-180 shadow-2xl rounded-4xl pb-4 overflow-y-auto"
        animate={{
          y: show ? 0 : "100lvh",
          transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
