"use client";

import { useEffect, useState } from "react";
import { MegaphoneIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { API_BASE_URL } from "@/lib/api";

interface Announcement {
  id: string;
  message: string;
}

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/announcements`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAnnouncements(data);
        }
      })
      .catch(() => {});
  }, []);

  if (dismissed || announcements.length === 0) return null;

  const text = announcements.map((a) => a.message).join("  ★  ");

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 text-white">
      <div className="flex items-center">
        {/* Icon */}
        <div className="flex-shrink-0 bg-primary-700/50 px-3 py-2">
          <MegaphoneIcon className="h-4 w-4" />
        </div>

        {/* Scrolling text */}
        <div className="flex-1 overflow-hidden py-1.5">
          <div className="marquee-scroll whitespace-nowrap text-body-sm font-medium">
            <span className="inline-block">{text}</span>
            <span className="inline-block ml-[100px]">{text}</span>
          </div>
        </div>

        {/* Dismiss button */}
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 px-3 py-2 text-white/70 hover:text-white transition-colors"
          title="Đóng"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>

      <style jsx>{`
        .marquee-scroll {
          display: inline-flex;
          animation: marquee-move 30s linear infinite;
        }
        .marquee-scroll:hover {
          animation-play-state: paused;
        }
        @keyframes marquee-move {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
