"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  CurrencyDollarIcon,
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  GiftIcon,
  ClockIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";

/* ── Coin packages ── */
const coinPackages = [
  { id: "pack1", coins: 10000, price: 10000, label: "10.000đ", bonus: 0 },
  { id: "pack2", coins: 20000, price: 20000, label: "20.000đ", bonus: 0 },
  { id: "pack3", coins: 50000, price: 50000, label: "50.000đ", bonus: 0 },
  { id: "pack4", coins: 100000, price: 100000, label: "100.000đ", bonus: 3000, popular: true },
  { id: "pack5", coins: 200000, price: 200000, label: "200.000đ", bonus: 7000 },
  { id: "pack6", coins: 500000, price: 500000, label: "500.000đ", bonus: 20000 },
];

const paymentMethods = [
  { id: "zalopay", label: "ZaloPay", icon: DevicePhoneMobileIcon, color: "bg-blue-50 text-blue-600 border-blue-200" },
  { id: "bank", label: "Chuyển khoản Agribank", icon: BanknotesIcon, color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
 ] as const;

type PaymentMethodId = (typeof paymentMethods)[number]["id"];

type PaymentField = {
  label: string;
  value: string;
  copyValue?: string;
};

type PaymentInfo = {
  title: string;
  qrSrc: string;
  fields: PaymentField[];
};

const PAYMENT_INFO: Record<PaymentMethodId, PaymentInfo> = {
  zalopay: {
    title: "ZaloPay",
    qrSrc: "/qr/qrzalopay.jpg",
    fields: [{ label: "Số điện thoại", value: "0584375253" }],
  },
  bank: {
    title: "Agribank",
    qrSrc: "/qr/qrnganhang.jpg",
    fields: [
      { label: "Ngân hàng", value: "Agribank" },
      { label: "Số tài khoản", value: "8888584375253" },
      { label: "Chủ tài khoản", value: "Nguyen Huy Phuc" },
      { label: "Chi nhánh", value: "Agribank CN Nghi Lộc Nghệ An" },
    ],
  },
};

interface Transaction {
  id: string;
  type: "deposit" | "spend";
  amount: number;
  description: string;
  date: string;
}

export default function WalletPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"deposit" | "history">("deposit");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Mock data — sẽ được thay bằng API thực tế
  const balance = 120;

  const transactions: Transaction[] = [
    { id: "1", type: "deposit", amount: 100, description: "Nạp xu – Gói 20.000đ", date: "11/02/2026" },
    { id: "2", type: "spend", amount: -20, description: "Mở khóa Chương 15 – Tiên nghịch", date: "10/02/2026" },
  ];

  const handleDeposit = () => {
    if (!selectedPack || !selectedMethod) return;
    setProcessing(true);
    // Mock — sẽ gọi API tạo giao dịch + redirect tới payment gateway
    setTimeout(() => {
      setProcessing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }, 2000);
  };

  if (status === "loading") {
    return (
      <>
        <Header />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        </div>
      </>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login?callbackUrl=/wallet");
    return null;
  }

  const selectedPackData = coinPackages.find((p) => p.id === selectedPack);
  const selectedMethodInfo =
    selectedMethod === "zalopay" || selectedMethod === "bank"
      ? PAYMENT_INFO[selectedMethod]
      : null;

  const handleCopy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      window.setTimeout(() => {
        setCopiedKey((prev) => (prev === key ? null : prev));
      }, 1600);
    } catch {
      // No-op: clipboard may be blocked in some browsers/contexts
    }
  };

  return (
    <>
      <Header />
      <main className="section-container py-8">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Page title */}
          <div>
            <h1 className="text-heading-lg font-bold text-gray-900">Ví xu</h1>
            <p className="mt-1 text-body-sm text-gray-500">
              Nạp xu để mở khóa các chương truyện trả phí
            </p>
          </div>

          {/* Balance card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-6 text-white shadow-lg">
            <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
            <div className="absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-white/5" />
            <div className="relative">
              <p className="text-body-sm font-medium text-white/80">Số dư hiện tại</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-4xl font-bold">{balance.toLocaleString()}</span>
                <span className="text-lg font-medium text-white/80">xu</span>
              </div>
              <p className="mt-2 text-caption text-white/60">
                {session?.user?.name} · {session?.user?.email}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
            <button
              onClick={() => setActiveTab("deposit")}
              className={`flex-1 rounded-lg py-2.5 text-body-sm font-semibold transition-all ${
                activeTab === "deposit"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Nạp xu
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 rounded-lg py-2.5 text-body-sm font-semibold transition-all ${
                activeTab === "history"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Lịch sử giao dịch
            </button>
          </div>

          {activeTab === "deposit" ? (
            <div className="space-y-6">
              {/* Success message */}
              {showSuccess && (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
                  <CheckCircleIcon className="h-6 w-6 flex-shrink-0 text-emerald-500" />
                  <div>
                    <p className="text-body-sm font-semibold text-emerald-800">Nạp xu thành công!</p>
                    <p className="text-caption text-emerald-600">
                      Xu đã được cộng vào tài khoản của bạn.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 1: Choose package */}
              <div>
                <h2 className="mb-4 flex items-center gap-2 text-body-lg font-semibold text-gray-900">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 text-caption font-bold text-white">
                    1
                  </span>
                  Chọn gói xu
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {coinPackages.map((pack) => (
                    <button
                      key={pack.id}
                      onClick={() => setSelectedPack(pack.id)}
                      className={`relative rounded-2xl border-2 p-4 text-left transition-all ${
                        selectedPack === pack.id
                          ? "border-primary-500 bg-primary-50 shadow-md"
                          : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
                      }`}
                    >
                      {pack.popular && (
                        <span className="absolute -top-2.5 left-3 rounded-full bg-rose-500 px-2.5 py-0.5 text-[10px] font-bold text-white">
                          Phổ biến
                        </span>
                      )}
                      <div className="flex items-center gap-2">
                        <CurrencyDollarIcon className={`h-5 w-5 ${selectedPack === pack.id ? "text-primary-500" : "text-amber-500"}`} />
                        <span className="text-heading-sm font-bold text-gray-900">
                          {pack.coins.toLocaleString()}
                        </span>
                        <span className="text-caption text-gray-400">xu</span>
                      </div>
                      {pack.bonus > 0 && (
                        <p className="mt-1 flex items-center gap-1 text-caption font-medium text-emerald-600">
                          <GiftIcon className="h-3.5 w-3.5" />
                          +{pack.bonus} xu tặng thêm
                        </p>
                      )}
                      <p className="mt-2 text-body-sm font-semibold text-gray-600">
                        {pack.label}
                      </p>
                      {selectedPack === pack.id && (
                        <CheckCircleIcon className="absolute right-3 top-3 h-5 w-5 text-primary-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Choose payment method */}
              <div>
                <h2 className="mb-4 flex items-center gap-2 text-body-lg font-semibold text-gray-900">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 text-caption font-bold text-white">
                    2
                  </span>
                  Phương thức thanh toán
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all ${
                        selectedMethod === method.id
                          ? "border-primary-500 bg-primary-50 shadow-md"
                          : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
                      }`}
                    >
                      <div className={`rounded-xl p-2.5 ${method.color.split(" ").slice(0, 2).join(" ")}`}>
                        <method.icon className={`h-6 w-6 ${method.color.split(" ")[1]}`} />
                      </div>
                      <span className="text-body-sm font-medium text-gray-700">{method.label}</span>
                      {selectedMethod === method.id && (
                        <CheckCircleIcon className="h-4 w-4 text-primary-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary + Pay button */}
              {selectedPack && selectedMethod && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h3 className="text-body-lg font-semibold text-gray-900">Xác nhận thanh toán</h3>

                  {selectedMethodInfo ? (
                    <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <p className="text-body-sm font-semibold text-gray-900">Thông tin thanh toán</p>
                      <p className="mt-1 text-caption text-gray-500">
                        Quét QR hoặc nhập thông tin bên dưới để chuyển khoản.
                      </p>

                      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_220px] sm:items-start">
                        <div className="space-y-2">
                          {selectedMethodInfo.fields.map((field) => {
                            const copyValue = field.copyValue ?? field.value;
                            const key = `${selectedMethod}-${field.label}`;
                            const isCopied = copiedKey === key;

                            return (
                              <div key={field.label} className="flex items-center justify-between gap-3">
                                <span className="text-caption text-gray-500">{field.label}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-body-sm font-semibold text-gray-900">
                                    {field.value}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(key, copyValue)}
                                    className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
                                    aria-label={`Sao chép ${field.label}`}
                                    title={isCopied ? "Đã copy" : "Copy"}
                                  >
                                    {isCopied ? (
                                      <ClipboardDocumentCheckIcon className="h-4 w-4" />
                                    ) : (
                                      <ClipboardDocumentIcon className="h-4 w-4" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            );
                          })}

                          {copiedKey ? (
                            <p className="pt-1 text-caption text-emerald-600">Đã copy</p>
                          ) : null}
                        </div>

                        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
                          <Image
                            src={selectedMethodInfo.qrSrc}
                            alt={
                              selectedMethod === "bank"
                                ? "QR chuyển khoản Agribank"
                                : "QR thanh toán ZaloPay"
                            }
                            width={440}
                            height={440}
                            className="h-auto w-full"
                          />
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-body-sm">
                      <span className="text-gray-500">Gói xu</span>
                      <span className="font-semibold text-gray-900">
                        {selectedPackData?.coins.toLocaleString()} xu
                        {selectedPackData?.bonus ? ` + ${selectedPackData.bonus} bonus` : ""}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-body-sm">
                      <span className="text-gray-500">Thanh toán qua</span>
                      <span className="font-semibold text-gray-900">
                        {paymentMethods.find((m) => m.id === selectedMethod)?.label}
                      </span>
                    </div>
                    <div className="border-t border-gray-100 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-body-md font-semibold text-gray-900">Tổng tiền</span>
                        <span className="text-heading-sm font-bold text-primary-600">
                          {selectedPackData?.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleDeposit}
                    disabled={processing}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3.5 text-body-md font-bold text-white shadow-lg transition-all hover:from-amber-600 hover:to-orange-600 disabled:opacity-50"
                  >
                    {processing ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <CreditCardIcon className="h-5 w-5" />
                        Tôi đã chuyển khoản {selectedPackData?.label}
                      </>
                    )}
                  </button>

                  <div className="mt-3 flex items-center justify-center gap-1.5 text-caption text-gray-400">
                    <ShieldCheckIcon className="h-3.5 w-3.5" />
                    Giao dịch được bảo mật & mã hóa
                  </div>
                </div>
              )}

              {/* Benefits info */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="text-body-lg font-semibold text-gray-900">Xu dùng để làm gì?</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  {[
                    {
                      icon: SparklesIcon,
                      title: "Mở khóa chương VIP",
                      desc: "Đọc các chương trả phí từ tác giả yêu thích",
                    },
                    {
                      icon: GiftIcon,
                      title: "Tặng quà tác giả",
                      desc: "Tặng xu cho tác giả để ủng hộ sáng tác",
                    },
                    {
                      icon: CurrencyDollarIcon,
                      title: "Không hết hạn",
                      desc: "Xu trong ví không có thời hạn sử dụng",
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex-shrink-0 rounded-xl bg-amber-50 p-2.5">
                        <item.icon className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-body-sm font-semibold text-gray-800">{item.title}</p>
                        <p className="mt-0.5 text-caption text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* History tab */
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-4">
                <h3 className="text-body-lg font-semibold text-gray-900">Lịch sử giao dịch</h3>
              </div>
              {transactions.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <ClockIcon className="mx-auto h-12 w-12 text-gray-200" />
                  <p className="mt-3 text-body-sm text-gray-500">Chưa có giao dịch nào</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center gap-4 px-6 py-4">
                      <div
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
                          tx.type === "deposit" ? "bg-emerald-50" : "bg-orange-50"
                        }`}
                      >
                        {tx.type === "deposit" ? (
                          <CurrencyDollarIcon className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <SparklesIcon className="h-5 w-5 text-orange-500" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-body-sm font-medium text-gray-900">{tx.description}</p>
                        <p className="mt-0.5 text-caption text-gray-400">{tx.date}</p>
                      </div>
                      <span
                        className={`text-body-sm font-bold ${
                          tx.amount > 0 ? "text-emerald-600" : "text-orange-600"
                        }`}
                      >
                        {tx.amount > 0 ? "+" : ""}
                        {tx.amount} xu
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
