import { NextResponse } from "next/server";
import { createCorsHeaders } from "@/lib/helpers";
import { getRequestUser, isAdmin } from "@/lib/auth";

/**
 * Internal Microservice Metrics & Configuration Endpoint
 * Intended to be shielded from external public traffic (simulated RFC 1918 internal endpoint)
 */
export async function GET(req: Request) {
  const user = getRequestUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: createCorsHeaders() });
  if (!isAdmin(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403, headers: createCorsHeaders() });
  return NextResponse.json(
    {
      service: "flowvault-internal-cluster-orchestrator",
      status: "healthy",
      timestamp: new Date().toISOString(),
      cluster: "flowvault-vpc-private-us-east-1",
      metrics: {
        active_workers: 14,
        memory_utilization: "78.4%",
        database_pool: "connected",
        active_tenants: 3,
      },
      internal_config: {
        vault_transit_key: "transit-key-prod-9988-INTERNAL-SECRET",
        flag_enterprise_mode: true,
        admin_debug_email: "admin-internal@flowvault.internal",
        aws_metadata_imds_v1_fallback: "enabled",
      },
    },
    {
      status: 200,
      headers: {
        ...createCorsHeaders(),
        "x-internal-service": "true",
      },
    }
  );
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: createCorsHeaders() });
}
