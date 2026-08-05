"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, PaperAirplaneIcon, MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { API_BASE_URL, authFetch } from "@/lib/api";

interface GiftType {
  id: string;
  name: string;
  emoji: string;
  price: number;
  animationUrl: string | null;
}

interface VirtualGiftPickerProps {
  isOpen: boolean;
  onClose: () => void;
  authorId: string;
  authorName: string;
  storyId?: string;
  storySlug?: string;
  token: string;
  onGiftSent?: (gift: { name: string; emoji: string; quantity: number; totalCoins: number }) => void;
}

export default function VirtualGiftPicker({
  isOpen,
  onClose,
  authorId,
  authorName,
  storyId,
  storySlug,
  token,
  onGiftSent,
}: VirtualGiftPickerProps) {
  const [giftTypes, setGiftTypes] = useState<GiftType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGift, setSelectedGift] = useState<GiftType | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);

  // Fetch gift types and user balance
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [giftsRes, walletRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/gifts/types`),
          authFetch("/api/wallet/balance", token),
        ]);
        const giftsData = await giftsRes.json();
        const walletData = await walletRes.json();
        setGiftTypes(giftsData.gifts || []);
        setUserBalance(walletData.coinBalance || 0);
        setSelectedGift(null);
        setQuantity(1);
        setMessage("");
        setSuccess(false);
        setError("");
      } catch {
        setError("Không thể tải danh sách quà");
      }
      setLoading(false);
    };

    fetchData();
  }, [isOpen, token]);

  // Close on escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const handleSend = async () => {
    if (!selectedGift || sending) return;
    setSending(true);
    setError("");
    setSuccess(false);

    try {
      const res = await authFetch("/api/gifts/send", token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: authorId,
          storyId: storyId || null,
          giftTypeId: selectedGift.id,
          quantity,
          message: message.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "Không đủ xu") {
          setError(`Không đủ xu! Bạn cần ${data.required?.toLocaleString("vi-VN")} xu, hiện có ${data.balance?.toLocaleString("vi-VN")} xu.`);
        } else {
          setError(data.error || "Không thể gửi quà");
        }
        setSending(false);
        return;
      }

      setUserBalance(data.newBalance);
      setSuccess(true);
      onGiftSent?.({
        name: selectedGift.name,
        emoji: selectedGift.emoji,
        quantity,
        totalCoins: data.spent,
      });

      // Auto close after 2s
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch {
      setError("Lỗi kết nối server");
    }
    setSending(false);
  };

  const totalCost = selectedGift ? selectedGift.price * quantity : 0;
  const canAfford = userBalance >= totalCost;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2"
          >
            <div className="mx-4 rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 p-4 dark:border-gray-700">
                <div>
                  <h2 className="text-heading-sm font-bold text-gray-900 dark:text-white">
                    🎁 Tặng quà cho {authorName}
                  </h2>
                  <p className="mt-0.5 text-caption text-gray-500">
                    Số dư: <span className="font-semibold text-amber-600">{userBalance.toLocaleString("vi-VN")} xu</span>
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
                  </div>
                ) : (
                  <>
                    {/* Gift Grid */}
                    <div className="mb-4">
                      <p className="mb-2 text-caption font-medium text-gray-500">Chọn quà</p>
                      <div className="grid grid-cols-4 gap-2">
                        {giftTypes.map((gift) => (
                          <button
                            key={gift.id}
                            onClick={() => {
                              setSelectedGift(gift);
                              setQuantity(1);
                              setError("");
                            }}
                            className={`flex flex-col items-center rounded-xl p-3 transition-all ${
                              selectedGift?.id === gift.id
                                ? "bg-primary-50 ring-2 ring-primary-500 dark:bg-primary-900/30"
                                : "bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
                            }`}
                          >
                            <span className="text-3xl">{gift.emoji}</span>
                            <span className="mt-1 text-[11px] font-medium text-gray-700 dark:text-gray-300">{gift.name}</span>
                            <span className="text-[11px] font-bold text-amber-600">{gift.price} xu</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Selected Gift Details */}
                    {selectedGift && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mb-4 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
                      >
                        {/* Quantity */}
                        <div className="mb-4">
                          <p className="mb-2 text-caption font-medium text-gray-500">Số lượng</p>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setQuantity(Math.max(1, quantity - 1))}
                              disabled={quantity <= 1}
                              className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                            >
                              <MinusIcon className="h-4 w-4" />
                            </button>
                            <input
                              type="number"
                              min={1}
                              max={99}
                              value={quantity}
                              onChange={(e) => setQuantity(Math.min(99, Math.max(1, parseInt(e.target.value) || 1)))}
                              className="w-16 rounded-lg border border-gray-200 bg-white px-3 py-2 text-center font-semibold focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                            <button
                              onClick={() => setQuantity(Math.min(99, quantity + 1))}
                              disabled={quantity >= 99}
                              className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                            >
                              <PlusIcon className="h-4 w-4" />
                            </button>
                            <span className="text-caption text-gray-400">× {quantity}</span>
                          </div>
                        </div>

                        {/* Quick quantity buttons */}
                        <div className="mb-4 flex gap-2">
                          {[1, 5, 10, 99].map((q) => (
                            <button
                              key={q}
                              onClick={() => setQuantity(q)}
                              className={`rounded-lg px-3 py-1.5 text-caption font-medium transition-colors ${
                                quantity === q
                                  ? "bg-primary-500 text-white"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {q === 99 ? "MAX" : q}
                            </button>
                          ))}
                        </div>

                        {/* Message */}
                        <div className="mb-4">
                          <p className="mb-2 text-caption font-medium text-gray-500">Lời nhắn (tùy chọn)</p>
                          <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Gửi lời nhắn đến tác giả..."
                            maxLength={200}
                            rows={2}
                            className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-body-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                          />
                          <p className="mt-1 text-right text-[11px] text-gray-400">{message.length}/200</p>
                        </div>

                        {/* Summary */}
                        <div className="flex items-center justify-between rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{selectedGift.emoji}</span>
                            <div>
                              <p className="text-body-sm font-semibold text-gray-900 dark:text-white">
                                {selectedGift.name} × {quantity}
                              </p>
                              <p className="text-caption text-gray-500">Tặng cho {authorName}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-caption text-gray-500">Tổng cộng</p>
                            <p className={`text-body-sm font-bold ${canAfford ? "text-amber-600" : "text-red-500"}`}>
                              {totalCost.toLocaleString("vi-VN")} xu
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Error */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 rounded-lg bg-red-50 p-3 text-body-sm text-red-600 dark:bg-red-900/20"
                      >
                        {error}
                      </motion.div>
                    )}

                    {/* Success */}
                    {success && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 rounded-lg bg-emerald-50 p-3 text-center text-body-sm font-medium text-emerald-600 dark:bg-emerald-900/20"
                      >
                        🎉 Tặng quà thành công! Cảm ơn bạn đã ủng hộ!
                      </motion.div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={onClose}
                        className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-body-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleSend}
                        disabled={!selectedGift || sending || success}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-3 text-body-sm font-semibold text-white shadow-lg transition-all hover:from-amber-600 hover:to-yellow-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {sending ? (
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <>
                            <PaperAirplaneIcon className="h-5 w-5" />
                            {sending ? "Đang gửi..." : `Gửi quà (${totalCost.toLocaleString("vi-VN")} xu)`}
                          </>
                        )}
                      </button>
                    </div>

                    {!canAfford && selectedGift && (
                      <p className="mt-2 text-center text-caption text-red-500">
                        Không đủ xu?{" "}
                        <a href="/wallet" className="font-semibold text-primary-600 hover:underline">
                          Nạp thêm xu →
                        </a>
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
