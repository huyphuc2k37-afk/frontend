"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "@/lib/api";

interface GiftAnimationItem {
  id: string;
  emoji: string;
  name: string;
  senderName: string;
  message?: string;
  quantity: number;
}

interface GiftAnimationProps {
  storyId?: string;
}

export function useGiftAnimation(storyId?: string) {
  const [animations, setAnimations] = useState<GiftAnimationItem[]>([]);

  const addAnimation = useCallback((gift: GiftAnimationItem) => {
    setAnimations((prev) => [...prev, gift]);
  }, []);

  const removeAnimation = useCallback((id: string) => {
    setAnimations((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // Poll for recent gifts on this story
  useEffect(() => {
    if (!storyId) return;

    const poll = () => {
      fetch(`${API_BASE_URL}/api/gifts/recent?storyId=${storyId}`)
        .then((r) => r.json())
        .then((data) => {
          const recentGifts: GiftAnimationItem[] = (data.gifts || []).map((g: any) => ({
            id: g.id,
            emoji: g.giftType.emoji,
            name: g.giftType.name,
            senderName: g.sender.name,
            message: g.message,
            quantity: g.quantity,
          }));
          // Only add new animations for gifts we haven't shown yet
          setAnimations((prev) => {
            const existingIds = new Set(prev.map((a) => a.id));
            const newOnes = recentGifts.filter((g) => !existingIds.has(g.id));
            return [...prev, ...newOnes];
          });
        })
        .catch(() => {});
    };

    poll();
    const interval = setInterval(poll, 15000); // Poll every 15 seconds
    return () => clearInterval(interval);
  }, [storyId]);

  return { animations, addAnimation, removeAnimation };
}

interface GiftAnimationProps2 {
  animations: GiftAnimationItem[];
  onRemove: (id: string) => void;
}

export default function GiftAnimation({ animations, onRemove }: GiftAnimationProps2) {
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      <AnimatePresence>
        {animations.map((gift) => (
          <GiftAnimationItem key={gift.id} gift={gift} onComplete={() => onRemove(gift.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function GiftAnimationItem({
  gift,
  onComplete,
}: {
  gift: GiftAnimationItem;
  onComplete: () => void;
}) {
  const [currentY, setCurrentY] = useState(-100);
  const [scale, setScale] = useState(0.5);
  const [opacity, setOpacity] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start animation sequence
    const startY = -120;
    const endY = typeof window !== "undefined" ? window.innerHeight * 0.6 : 600;
    const duration = 4000;
    const steps = 100;
    const stepDuration = duration / steps;

    let step = 0;
    const randomX = Math.random() * 60 + 20; // 20-80% from left

    const interval = setInterval(() => {
      step++;
      const progress = step / steps;

      if (progress < 0.3) {
        // Scale up phase (0-30%)
        const scaleProgress = progress / 0.3;
        setScale(0.5 + scaleProgress * 0.5);
        setOpacity(scaleProgress);
        setCurrentY(startY + (endY * 0.2) * scaleProgress);
      } else if (progress < 0.7) {
        // Falling phase (30-70%)
        const fallProgress = (progress - 0.3) / 0.4;
        const bounceY = Math.sin(fallProgress * Math.PI * 3) * 20; // Bounce effect
        setCurrentY(endY * 0.2 + endY * 0.6 * fallProgress + bounceY);
        setScale(1 + Math.sin(fallProgress * Math.PI) * 0.1);
        setOpacity(1);
      } else if (progress < 0.85) {
        // Hover at bottom (70-85%)
        setCurrentY(endY);
        setShowDetails(true);
        setOpacity(1);
      } else {
        // Fade out (85-100%)
        const fadeProgress = (progress - 0.85) / 0.15;
        setOpacity(1 - fadeProgress);
        setFadeOut(true);
      }

      if (progress >= 1) {
        clearInterval(interval);
        onComplete();
      }
    }, stepDuration);

    // Random horizontal position
    const randomDelay = Math.random() * 500;
    setTimeout(() => {
      setCurrentY(startY);
    }, randomDelay);

    return () => clearInterval(interval);
  }, [onComplete]);

  const randomX = Math.random() * 60 + 20;
  const size = gift.quantity > 10 ? 80 : gift.quantity > 5 ? 70 : 60;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity,
        y: currentY,
        x: `${randomX}%`,
        scale,
      }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 10,
      }}
      className="absolute"
      style={{
        left: 0,
        transform: `translateX(-50%)`,
        width: size,
        height: size,
      }}
    >
      {/* Gift emoji with glow effect */}
      <div
        className="relative flex items-center justify-center"
        style={{
          width: size,
          height: size,
        }}
      >
        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-full animate-pulse"
          style={{
            background: `radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%)`,
            filter: "blur(8px)",
          }}
        />
        {/* Emoji */}
        <span
          className="relative text-5xl drop-shadow-lg"
          style={{
            fontSize: size * 0.7,
            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
          }}
        >
          {gift.emoji}
        </span>

        {/* Quantity badge */}
        {gift.quantity > 1 && (
          <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white shadow-lg">
            ×{gift.quantity}
          </div>
        )}
      </div>

      {/* Details popup - appears below the gift */}
      <AnimatePresence>
        {showDetails && !fadeOut && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-white/95 px-4 py-2 shadow-xl backdrop-blur-sm dark:bg-gray-900/95"
          >
            <p className="text-center text-body-sm font-semibold text-gray-900 dark:text-white">
              🎁 {gift.senderName}
            </p>
            <p className="text-center text-caption text-gray-500">
              tặng {gift.quantity}× {gift.emoji} {gift.name}
            </p>
            {gift.message && (
              <p className="mt-1 max-w-[200px] truncate text-center text-[11px] italic text-gray-400">
                &ldquo;{gift.message}&rdquo;
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Standalone notification-style animation for when a gift is sent
interface GiftSentNotificationProps {
  gift: { emoji: string; name: string; quantity: number };
  onComplete: () => void;
}

export function GiftSentNotification({ gift, onComplete }: GiftSentNotificationProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.8 }}
      className="fixed bottom-6 right-6 z-50 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 p-4 shadow-2xl"
    >
      <div className="flex items-center gap-3">
        <span className="text-4xl">{gift.emoji}</span>
        <div>
          <p className="text-body-sm font-bold text-white">Đã gửi quà thành công!</p>
          <p className="text-caption text-white/80">
            {gift.quantity}× {gift.name}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
