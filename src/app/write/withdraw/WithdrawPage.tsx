"use client";

import { useState } from "react";
import {
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  BuildingLibraryIcon,
} from "@heroicons/react/24/outline";
import { useStudio } from "@/components/StudioLayout";
import Link from "next/link";

type WithdrawStatus = "pending" | "completed" | "rejected";

interface WithdrawRecord {
  id: string;
  amount: number;
  status: WithdrawStatus;
  bankName: string;
  bankAccount: string;
  createdAt: string;
  completedAt?: string;
  note?: string;
}

export default function WithdrawPage() {
  const { profile } = useStudio();
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankHolder, setBankHolder] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // TODO: Fetch from API
  const availableBalance = 0;
  const minWithdraw = 50000;

  const withdrawHistory: WithdrawRecord[] = [
    // Will be populated from API
  ];

  const formatVND = (n: number) =>
    new Intl.NumberFormat("vi-VN").format(n);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) < minWithdraw) return;
    setSubmitting(true);
    // API call sẽ thêm sau
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      setShowForm(false);
      setAmount("");
    }, 1500);
  };

  const statusConfig: Record<WithdrawStatus, { label: string; color: string; icon: any }> = {
    pending: {
      label: "Đang xử lý",
      color: "text-amber-600 bg-amber-50",
      icon: ClockIcon,
    },
    completed: {
      label: "Đã chuyển",
      color: "text-emerald-600 bg-emerald-50",
      icon: CheckCircleIcon,
    },
    rejected: {
      label: "Từ chối",
      color: "text-red-600 bg-red-50",
      icon: XCircleIcon,
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-heading-md font-bold text-gray-900">Rút tiền</h2>
          <p className="mt-1 text-body-sm text-gray-500">
            Rút xu từ doanh thu tác phẩm về tài khoản ngân hàng
          </p>
        </div>
        <Link
          href="/write/revenue"
          className="inline-flex items-center gap-2 self-start rounded-xl border border-gray-200 px-4 py-2 text-body-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <CurrencyDollarIcon className="h-4 w-4" />
          Xem doanh thu
        </Link>
      </div>

      {/* Balance card */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white shadow-lg">
        <p className="text-body-sm font-medium text-emerald-100">Số dư khả dụng</p>
        <p className="mt-1 text-3xl font-bold">{formatVND(availableBalance)} xu</p>
        <p className="mt-2 text-caption text-emerald-100">
          Rút tối thiểu: {formatVND(minWithdraw)} xu · Tỷ lệ quy đổi: 1 xu = 1 VNĐ
        </p>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-body-sm font-semibold text-emerald-600 shadow-sm hover:bg-emerald-50"
          >
            <BanknotesIcon className="h-4 w-4" />
            Tạo yêu cầu rút tiền
          </button>
        )}
      </div>

      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
          <p className="text-body-sm text-emerald-700">
            Yêu cầu rút tiền đã được gửi! Chúng tôi sẽ xử lý trong 1-3 ngày làm việc.
          </p>
        </div>
      )}

      {/* Withdraw form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-5"
        >
          <h3 className="text-body-lg font-semibold text-gray-900">Tạo yêu cầu rút tiền</h3>

          <div>
            <label className="mb-1 block text-caption font-medium text-gray-700">
              Số xu muốn rút
            </label>
            <div className="relative">
              <input
                type="number"
                min={minWithdraw}
                max={availableBalance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Tối thiểu ${formatVND(minWithdraw)}`}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-body-md focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                required
              />
              <button
                type="button"
                onClick={() => setAmount(String(availableBalance))}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-200"
              >
                Tất cả
              </button>
            </div>
            {amount && Number(amount) > 0 && (
              <p className="mt-1 text-caption text-gray-400">
                ≈ {formatVND(Number(amount))} VNĐ
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-caption font-medium text-gray-700">
                Ngân hàng
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="VD: Vietcombank, MB Bank..."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-body-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-caption font-medium text-gray-700">
                Số tài khoản
              </label>
              <input
                type="text"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="Nhập số tài khoản"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-body-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-caption font-medium text-gray-700">
              Chủ tài khoản
            </label>
            <input
              type="text"
              value={bankHolder}
              onChange={(e) => setBankHolder(e.target.value)}
              placeholder="Nhập tên chủ tài khoản (viết hoa, không dấu)"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-body-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              required
            />
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-4">
            <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 text-amber-500" />
            <p className="text-caption text-amber-700">
              Vui lòng kiểm tra thông tin ngân hàng chính xác. Nếu sai thông tin, giao dịch sẽ bị từ chối và xu sẽ được hoàn lại.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-body-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || !amount || Number(amount) < minWithdraw}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-body-sm font-semibold text-white shadow-md hover:bg-emerald-600 disabled:opacity-50"
            >
              <BanknotesIcon className="h-4 w-4" />
              {submitting ? "Đang gửi..." : "Xác nhận rút tiền"}
            </button>
          </div>
        </form>
      )}

      {/* History */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h3 className="text-body-lg font-semibold text-gray-900">
            Lịch sử rút tiền
          </h3>
        </div>
        {withdrawHistory.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <BanknotesIcon className="mx-auto h-12 w-12 text-gray-200" />
            <p className="mt-3 text-body-sm text-gray-500">Chưa có yêu cầu rút tiền nào</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {withdrawHistory.map((record) => {
              const status = statusConfig[record.status];
              return (
                <div key={record.id} className="flex items-center gap-4 px-6 py-4">
                  <div className={`rounded-xl p-2 ${status.color}`}>
                    <status.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-body-sm font-medium text-gray-900">
                      {formatVND(record.amount)} xu
                    </p>
                    <p className="mt-0.5 text-[11px] text-gray-400">
                      {record.bankName} · *{record.bankAccount.slice(-4)} · {record.createdAt}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${status.color}`}>
                    {status.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
