export type BookingStatus =
  | "DRAFT"
  | "PENDING"
  | "CONFIRMED"
  | "PROFESSIONAL_ASSIGNED"
  | "PROFESSIONAL_ACCEPTED"
  | "ON_THE_WAY"
  | "ARRIVED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUND_PENDING"
  | "REFUNDED"
  | "DISPUTED";

// Strict state transition map to eliminate invalid state jumps
const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  DRAFT: ["PENDING", "CANCELLED"],
  PENDING: ["CONFIRMED", "PROFESSIONAL_ASSIGNED", "CANCELLED"],
  CONFIRMED: ["PROFESSIONAL_ASSIGNED", "PROFESSIONAL_ACCEPTED", "CANCELLED"],
  PROFESSIONAL_ASSIGNED: ["PROFESSIONAL_ACCEPTED", "CANCELLED", "CONFIRMED"],
  PROFESSIONAL_ACCEPTED: ["ON_THE_WAY", "CANCELLED"],
  ON_THE_WAY: ["ARRIVED", "CANCELLED", "DISPUTED"],
  ARRIVED: ["IN_PROGRESS", "CANCELLED", "DISPUTED"],
  IN_PROGRESS: ["COMPLETED", "DISPUTED"],
  COMPLETED: ["DISPUTED", "REFUND_PENDING"],
  CANCELLED: ["REFUND_PENDING"],
  REFUND_PENDING: ["REFUNDED"],
  REFUNDED: [],
  DISPUTED: ["IN_PROGRESS", "COMPLETED", "REFUND_PENDING", "CANCELLED"],
};

export class BookingEngine {
  static isValidTransition(current: BookingStatus, next: BookingStatus): boolean {
    const allowed = VALID_TRANSITIONS[current] || [];
    return allowed.includes(next);
  }

  static getNextValidStatuses(current: BookingStatus): BookingStatus[] {
    return VALID_TRANSITIONS[current] || [];
  }

  static canCancel(status: BookingStatus): boolean {
    return ["DRAFT", "PENDING", "CONFIRMED", "PROFESSIONAL_ASSIGNED", "PROFESSIONAL_ACCEPTED"].includes(status);
  }

  static canReview(status: BookingStatus): boolean {
    return status === "COMPLETED";
  }

  static isTerminal(status: BookingStatus): boolean {
    return ["COMPLETED", "CANCELLED", "REFUNDED"].includes(status);
  }

  static getDisplayStatus(status: string): { label: string; color: string; description: string } {
    switch (status) {
      case "PENDING":
        return { label: "Pending Assignment", color: "bg-amber-100 text-amber-800 border-amber-300", description: "Finding best local professional" };
      case "CONFIRMED":
        return { label: "Confirmed", color: "bg-blue-100 text-blue-800 border-blue-300", description: "Booking confirmed by Worksy" };
      case "PROFESSIONAL_ASSIGNED":
        return { label: "Pro Assigned", color: "bg-indigo-100 text-indigo-800 border-indigo-300", description: "Professional notified" };
      case "PROFESSIONAL_ACCEPTED":
        return { label: "Pro Accepted", color: "bg-teal-100 text-teal-800 border-teal-300", description: "Partner accepted your job" };
      case "ON_THE_WAY":
        return { label: "On The Way", color: "bg-purple-100 text-purple-800 border-purple-300", description: "Partner is traveling to your location" };
      case "ARRIVED":
        return { label: "Arrived", color: "bg-sky-100 text-sky-800 border-sky-300", description: "Partner has reached your doorstep" };
      case "IN_PROGRESS":
        return { label: "In Progress", color: "bg-yellow-100 text-yellow-800 border-yellow-300", description: "Service is currently being executed" };
      case "COMPLETED":
        return { label: "Completed", color: "bg-emerald-100 text-emerald-800 border-emerald-300", description: "Service verified and completed" };
      case "CANCELLED":
        return { label: "Cancelled", color: "bg-rose-100 text-rose-800 border-rose-300", description: "Booking was cancelled" };
      case "REFUNDED":
        return { label: "Refunded", color: "bg-slate-100 text-slate-800 border-slate-300", description: "Payment has been refunded" };
      case "DISPUTED":
        return { label: "Dispute Opened", color: "bg-orange-100 text-orange-800 border-orange-300", description: "Under Worksy operational arbitration" };
      default:
        return { label: status, color: "bg-gray-100 text-gray-800 border-gray-300", description: "" };
    }
  }
}
