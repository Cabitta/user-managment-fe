/**
 * UsersPage.jsx — Panel de administración de usuarios.
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDebounce } from "use-debounce";
import { getUsers, deleteUser } from "../api/users.api";
import { useAuthStore } from "../store/authStore";
import { ThemeToggle } from "../components/shared/ThemeToggle";

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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Search as SearchIcon,
  Eye as EyeIcon,
  Trash2 as TrashIcon,
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
  Loader2 as LoadingIcon,
  AlertCircle as ErrorIcon,
  User as UserIcon,
  Calendar as CalendarIcon,
} from "lucide-react";

export default function UsersPage() {
  const currentUser = useAuthStore((state) => state.user);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const handleDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const response = await deleteUser(userToDelete._id);
      if (response.success) {
        fetchUsers();
        setUserToDelete(null);
      }
    } catch (err) {
      console.error("Error al borrar usuario:", err);
      setDeleteError(
        err.response?.data?.error?.message ||
          "No se pudo desactivar el usuario.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDeleteDialog = (open) => {
    if (!open) {
      setUserToDelete(null);
      setDeleteError(null);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
            <p className="text-muted-foreground">
              Gestioná los usuarios del sistema, sus roles y estados.
            </p>
          </div>
          <ThemeToggle />
        </div>
        <Link to="/profile">
          <Avatar className="h-11 w-11 cursor-pointer border-2 border-primary/20 hover:border-primary transition-all shadow-sm">
            <AvatarFallback className="bg-primary/5 text-primary">
              <UserIcon className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>

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

      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead className="hidden lg:table-cell">Creado</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center">
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
                <TableCell colSpan={6} className="h-48 text-center">
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
                <TableCell colSpan={6} className="h-48 text-center">
                  <p className="text-muted-foreground">
                    No se encontraron usuarios.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u._id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {u.email}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={u.role === "admin" ? "default" : "secondary"}
                    >
                      {u.role.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      {new Date(u.createdAt).toLocaleDateString("es-ES")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.isActive ? "outline" : "destructive"}>
                      {u.isActive ? "ACTIVO" : "INACTIVO"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        asChild
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        title="Ver detalle"
                      >
                        <Link to={`/users/${u._id}`}>
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        disabled={!u.isActive}
                        onClick={() => setUserToDelete(u)}
                        title="Desactivar"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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

      <AlertDialog open={!!userToDelete} onOpenChange={handleCloseDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción desactivará al usuario{" "}
              <strong>{userToDelete?.name}</strong>. No podrá iniciar sesión
              hasta que un administrador lo reactive.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteError && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md border border-destructive/20 flex items-center gap-2">
              <ErrorIcon className="h-4 w-4 shrink-0" />
              <p>{deleteError}</p>
            </div>
          )}

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
