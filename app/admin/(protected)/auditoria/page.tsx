import { requireAdmin } from '@/lib/auth/admin';
import { createAdminClient } from '@/lib/supabase/admin';
import styles from '../../admin.module.css';

export default async function AuditPage() {
  await requireAdmin(['owner', 'admin']);
  const db = createAdminClient();
  const { data, error } = await db
    .from('admin_audit_log')
    .select('id, created_at, actor_user_id, action, entity_type, entity_id, metadata')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw new Error(`Falha ao carregar auditoria: ${error.message}`);
  return (
    <>
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>Segurança</p>
        <h1>Auditoria</h1>
        <p>
          Últimas 200 mutações administrativas. Secrets e payloads sensíveis não são registrados.
        </p>
      </header>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Data</th>
              <th>Ação</th>
              <th>Entidade</th>
              <th>Ator</th>
              <th>Metadados</th>
            </tr>
          </thead>
          <tbody>
            {data.map((entry) => (
              <tr key={entry.id}>
                <td>
                  {new Intl.DateTimeFormat('pt-BR', {
                    dateStyle: 'short',
                    timeStyle: 'medium',
                  }).format(new Date(entry.created_at))}
                </td>
                <td>{entry.action}</td>
                <td>
                  {entry.entity_type}
                  <br />
                  <small>{entry.entity_id}</small>
                </td>
                <td>
                  <small>{entry.actor_user_id}</small>
                </td>
                <td>
                  <pre className={styles.json}>{JSON.stringify(entry.metadata, null, 2)}</pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
