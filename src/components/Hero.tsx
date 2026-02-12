"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section
      className="relative flex min-h-[100dvh] items-center overflow-hidden bg-gradient-hero"
      aria-label="Hero"
    >
      {/* Animated background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-primary-700/20 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-accent-500/20 blur-[120px]" />
        <div className="absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-primary-500/10 blur-[80px]" />

        {/* SVG wave at bottom */}
        <svg
          className="absolute bottom-0 left-0 w-full"
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0 60L48 52C96 44 192 28 288 24C384 20 480 28 576 40C672 52 768 68 864 72C960 76 1056 68 1152 56C1248 44 1344 28 1392 20L1440 12V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0V60Z"
            className="fill-white"
          />
        </svg>

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-2 w-2 rounded-full bg-primary-400/30"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="section-container relative z-10 pb-24 pt-28">
        <div className="mx-auto max-w-prose text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <span className="mb-4 inline-block rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-1.5 text-body-sm font-medium text-primary-300">
              Nền tảng truyện dành cho người Việt
            </span>
          </motion.div>

          <motion.h1
            className="mt-6 text-display-md text-white sm:text-display-lg"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          >
            VStory —{" "}
            <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
              Câu chuyện
            </span>{" "}
            của người Việt
          </motion.h1>

          <motion.p
            className="mx-auto mt-6 max-w-xl text-body-lg leading-relaxed text-gray-300"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          >
            Đọc truyện đa thể loại và ủng hộ tác giả
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
          >
            <Link href="/explore" className="btn-primary px-8 py-4 text-lg">
              Bắt đầu đọc
            </Link>
            <Link
              href="/author"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/20 px-8 py-4 text-lg font-semibold text-white transition-all hover:border-white/40 hover:bg-white/5"
            >
              Trở thành tác giả
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="mt-16 flex items-center justify-center gap-8 sm:gap-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            {[
              { value: "10K+", label: "Truyện" },
              { value: "500K+", label: "Độc giả" },
              { value: "2K+", label: "Tác giả" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-heading-lg text-white">{stat.value}</div>
                <div className="text-caption text-gray-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
