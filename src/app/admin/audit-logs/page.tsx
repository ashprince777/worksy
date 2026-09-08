import { db } from "@/lib/db";
import { History, ShieldCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function AdminAuditLogsPage() {
  const logs = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
          Compliance & Security
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
          Immutable Operational Audit Trail
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Every administrative state change, KYC decision, price adjustment, and refund is permanently logged.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
        {logs.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <div key={log.id} className="py-4 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-black text-[10px] bg-slate-900 text-white">
                      {log.action}
                    </span>
                    <span className="font-bold text-slate-900">
                      Entity: {log.entity}
                    </span>
                    {log.entityId && (
                      <span className="text-slate-400 font-mono text-[11px]">
                        ID: {log.entityId.slice(-8)}
                      </span>
                    )}
                  </div>
                  <span className="text-slate-400 text-[11px]">
                    {formatDate(log.createdAt)}
                  </span>
                </div>

                <div className="text-slate-500 text-[11px]">
                  Performed by: <strong className="text-slate-700">{log.userEmail || "System Automation"}</strong>
                </div>

                {log.newValueJson && (
                  <pre className="p-2.5 rounded-xl bg-slate-50 text-[11px] font-mono text-slate-700 overflow-x-auto border border-slate-200">
                    {log.newValueJson}
                  </pre>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 text-xs">
            No audit records yet. Administrative actions will populate here automatically.
          </div>
        )}
      </div>
    </div>
  );
}
