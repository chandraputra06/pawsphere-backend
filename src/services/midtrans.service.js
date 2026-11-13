const crypto = require("crypto");
const midtransClient = require("midtrans-client");
const { env } = require("../config/env");
const ApiError = require("../utils/api-error");

let snapClient;

const getSnapClient = () => {
  const { serverKey, clientKey, isProduction } = env.midtrans;
  if (!serverKey || !clientKey) {
    throw new ApiError(
      503,
      "Konfigurasi Midtrans belum lengkap",
      "payment-provider-unavailable"
    );
  }

  if (!snapClient) {
    snapClient = new midtransClient.Snap({
      isProduction,
      serverKey,
      clientKey,
    });
  }

  return snapClient;
};

const createQrisRedirect = async ({ reservation, user, itemDetails }) => {
  const { isProduction } = env.midtrans;
  const finishUrl = new URL(
    `/clinic/${encodeURIComponent(reservation.clinicId)}/berhasil`,
    env.frontendUrl
  );
  finishUrl.searchParams.set("reservationId", reservation.id);

  try {
    const transaction = await getSnapClient().createTransaction({
      transaction_details: {
        order_id: reservation.midtransOrderId,
        gross_amount: reservation.estimatedTotal,
      },
      item_details: itemDetails,
      customer_details: {
        first_name: user.name.slice(0, 50),
        email: user.email,
        phone: user.phoneNumber || undefined,
      },
      enabled_payments: ["gopay"],
      callbacks: {
        finish: finishUrl.toString(),
      },
    });

    if (!transaction.token || !transaction.redirect_url) {
      throw new Error("Snap did not return checkout details");
    }
    const checkoutUrl = new URL(transaction.redirect_url);
    const expectedOrigin = isProduction
      ? "https://app.midtrans.com"
      : "https://app.sandbox.midtrans.com";
    if (checkoutUrl.origin !== expectedOrigin) {
      throw new Error("Snap returned an unexpected checkout URL");
    }

    return {
      token: transaction.token,
      redirectUrl: checkoutUrl.toString(),
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error("[Midtrans] Failed to create Snap checkout");
    throw new ApiError(
      502,
      "Tidak dapat membuat sesi pembayaran QRIS. Reservasi belum dapat dibayar.",
      "payment-provider-error"
    );
  }
};

const getQrisTransactionStatus = async (orderId) => {
  try {
    return await getSnapClient().transaction.status(orderId);
  } catch (error) {
    if (error.httpStatusCode === 404) return null;
    console.error("[Midtrans] Failed to retrieve transaction status");
    throw new ApiError(
      502,
      "Tidak dapat memeriksa status pembayaran dari Midtrans.",
      "payment-provider-error"
    );
  }
};

const verifyNotificationSignature = (notification) => {
  const secret = env.midtrans.serverKey;
  if (!secret) {
    throw new ApiError(
      503,
      "Konfigurasi verifikasi notifikasi Midtrans belum tersedia",
      "payment-provider-unavailable"
    );
  }

  const { order_id: orderId, status_code: statusCode, gross_amount: grossAmount, signature_key: signature } =
    notification || {};

  if (
    typeof orderId !== "string" ||
    typeof statusCode !== "string" ||
    typeof grossAmount !== "string" ||
    typeof signature !== "string" ||
    !/^[a-f0-9]{128}$/i.test(signature)
  ) {
    return false;
  }

  const expected = crypto
    .createHash("sha512")
    .update(`${orderId}${statusCode}${grossAmount}${secret}`)
    .digest();
  const received = Buffer.from(signature, "hex");

  return expected.length === received.length &&
    crypto.timingSafeEqual(expected, received);
};

const amountToMinorUnits = (value) => {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(String(value));
  if (!match) return null;

  const whole = BigInt(match[1]);
  const fraction = BigInt((match[2] || "").padEnd(2, "0"));
  return whole * 100n + fraction;
};

module.exports = {
  amountToMinorUnits,
  createQrisRedirect,
  getQrisTransactionStatus,
  verifyNotificationSignature,
};
