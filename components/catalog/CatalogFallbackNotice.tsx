export function CatalogFallbackNotice({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="noticeBox" role="status" data-testid="catalog-fallback">
      {message}
    </div>
  );
}
