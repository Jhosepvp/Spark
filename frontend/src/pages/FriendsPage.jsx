// NOTE: saved_connections ya existe en la base de datos, pero las rutas
// REST (/api/friends) todavía no están implementadas en el backend.
// Esta vista queda lista para conectarse en cuanto existan.

export function FriendsPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
      <h2 className="text-lg font-medium text-text">Amigos guardados</h2>
      <p className="max-w-xs text-sm text-text-muted">
        Aquí aparecerán las personas que guardes durante un chat, con el
        alias local que les hayas puesto. Todavía no has guardado a nadie.
      </p>
    </div>
  );
}
