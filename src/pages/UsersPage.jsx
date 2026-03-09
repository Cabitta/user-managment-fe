/**
 * UsersPage.jsx — Panel de administración de usuarios.
 *
 * Responsabilidad:
 * - Listar todos los usuarios con paginación (Spec 3.2).
 * - Buscar por nombre/email con debounce.
 * - Realizar borrado lógico (soft-delete).
 * - Solo accesible para el rol 'admin'.
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDebounce } from "use-debounce";
import { getUsers, deleteUser } from "../api/users.api";

// UI Components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search as SearchIcon,
  MoreHorizontal as MoreIcon,
  Eye as EyeIcon,
  Trash2 as TrashIcon,
  UserPlus as AddIcon,
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
  Loader2 as LoadingIcon,
  AlertCircle as ErrorIcon,
} from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros y Paginación
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Estado para el modal de borrado
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Carga de datos
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUsers({
        page: currentPage,
        limit: 10,
        search: debouncedSearch,
      });

      if (response.success) {
        setUsers(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalUsers(response.pagination.total);
      }
    } catch (err) {
      console.error("Error cargando usuarios:", err);
      setError(
        "No se pudieron cargar los usuarios. Verificá la conexión con el backend.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, debouncedSearch]);

  // Resetear página al buscar
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const handleDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      const response = await deleteUser(userToDelete._id);
      if (response.success) {
        // Recargar la lista actual
        fetchUsers();
        setUserToDelete(null);
      }
    } catch (err) {
      console.error("Error al borrar usuario:", err);
      alert("No se pudo desactivar el usuario.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-muted-foreground">
            Gestioná los usuarios del sistema, sus roles y estados.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/register">
            <AddIcon className="h-4 w-4" />
            Nuevo Usuario
          </Link>
        </Button>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative w-full">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o email..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABLA DE USUARIOS */}
      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <LoadingIcon className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Cargando usuarios...
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center">
                  <div className="flex flex-col items-center gap-2 text-destructive">
                    <ErrorIcon className="h-8 w-8" />
                    <p className="font-medium">{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchUsers}
                      className="mt-2"
                    >
                      Reintentar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center">
                  <p className="text-muted-foreground">
                    No se encontraron usuarios.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u._id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={u.role === "admin" ? "default" : "secondary"}
                    >
                      {u.role.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.isActive ? "outline" : "destructive"}>
                      {u.isActive ? "ACTIVO" : "INACTIVO"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link
                            to={`/users/${u._id}`}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <EyeIcon className="h-4 w-4" /> Ver detalle
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
                          disabled={!u.isActive}
                          onClick={() => setUserToDelete(u)}
                        >
                          <TrashIcon className="h-4 w-4" /> Desactivar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINACIÓN */}
      {!loading && !error && users.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {users.length} de {totalUsers} usuarios
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <PrevIcon className="h-4 w-4" />
              Anterior
            </Button>
            <div className="text-sm font-medium">
              Página {currentPage} de {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente
              <NextIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN PARA BORRADO */}
      <AlertDialog
        open={!!userToDelete}
        onOpenChange={(open) => !open && setUserToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción desactivará al usuario{" "}
              <strong>{userToDelete?.name}</strong>. No podrá iniciar sesión
              hasta que un administrador lo reactive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <LoadingIcon className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Confirmar Desactivación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
