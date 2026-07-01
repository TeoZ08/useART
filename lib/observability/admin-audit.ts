import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';

export async function writeAdminAudit(input: {
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, string | number | boolean | null>;
}) {
  const admin = createAdminClient();
  const { error } = await admin.from('admin_audit_log').insert({
    actor_user_id: input.actorUserId,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId,
    metadata: input.metadata ?? {},
  });
  if (error) throw new Error(`Falha ao registrar auditoria: ${error.message}`);
}
