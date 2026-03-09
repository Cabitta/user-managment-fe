/**
 * AuthPage.jsx — Pantalla de Login y Registro.
 *
 * Responsabilidad: Orquestar el flujo de autenticación.
 *
 * - UI: Usa Tabs de shadcn/ui para alternar modos.
 * - Form: Manejado con React Hook Form (formularios independientes).
 * - Seguridad: Mapeo preciso de la respuesta del backend (spec 4.1).
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../store/authStore";
import {
  login as loginService,
  register as registerService,
} from "../api/auth.api";

// UI Components (shadcn/ui)
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function AuthPage() {
  const navigate = useNavigate();
  const { setSession } = useAuthStore();
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [successMessage, setSuccessMessage] = useState(null);

  const loginForm = useForm({ mode: "onTouched" });
  const registerForm = useForm({ mode: "onTouched" });

  useEffect(() => {
    setApiError(null);
    setSuccessMessage(null);
    loginForm.reset();
    registerForm.reset();
  }, [activeTab]);

  const onLoginSubmit = async (data) => {
    setApiError(null);
    setIsLoading(true);
    try {
      const response = await loginService({
        email: data.email,
        password: data.password,
      });

      // El backend devuelve: { success: true, token: "...", data: { user_obj } }
      if (response.success) {
        setSession(response.data, response.token);
        navigate(response.data.role === "admin" ? "/users" : "/profile");
      }
    } catch (error) {
      console.error("Error en login:", error);
      const message =
        error.response?.data?.error?.message ||
        "Error al iniciar sesión. Verificá tus credenciales.";
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (data) => {
    setApiError(null);
    setIsLoading(true);
    try {
      const response = await registerService({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      // El backend devuelve: { success: true, data: { user_obj } } -> SIN TOKEN
      if (response.success) {
        if (response.token) {
          setSession(response.data, response.token);
          navigate(response.data.role === "admin" ? "/users" : "/profile");
        } else {
          setSuccessMessage(
            "¡Cuenta creada con éxito! Ahora podés iniciar sesión.",
          );
          setActiveTab("login");
        }
      }
    } catch (error) {
      console.error("Error en registro:", error);
      const message =
        error.response?.data?.error?.message ||
        "Error al crear la cuenta. El email podría estar en uso.";
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-background">
      <div className="flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Registro</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Iniciar Sesión</CardTitle>
                <CardDescription>
                  Ingresá tus credenciales para continuar.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {successMessage && (
                  <div className="mb-4 p-3 text-sm font-medium border border-green-500/50 bg-green-500/10 text-green-600 rounded-md">
                    ✓ {successMessage}
                  </div>
                )}

                <form
                  onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      placeholder="ana@ejemplo.com"
                      {...loginForm.register("email", {
                        required: "El email es requerido",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Email inválido",
                        },
                      })}
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-sm font-medium text-destructive">
                        {loginForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Contraseña</Label>
                    <Input
                      id="login-password"
                      type="password"
                      autoComplete="current-password"
                      {...loginForm.register("password", {
                        required: "La contraseña es requerida",
                      })}
                    />
                    {loginForm.formState.errors.password && (
                      <p className="text-sm font-medium text-destructive">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  {apiError && (
                    <div className="p-3 text-sm font-medium border border-destructive/50 bg-destructive/10 text-destructive rounded-md">
                      ⚠ {apiError}
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Enviando..." : "Iniciar sesión"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Nueva Cuenta</CardTitle>
                <CardDescription>
                  Completá tus datos para registrarte.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Nombre completo</Label>
                    <Input
                      id="reg-name"
                      autoComplete="name"
                      placeholder="Ana García"
                      {...registerForm.register("name", {
                        required: "El nombre es requerido",
                      })}
                    />
                    {registerForm.formState.errors.name && (
                      <p className="text-sm font-medium text-destructive">
                        {registerForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      autoComplete="email"
                      placeholder="ana@ejemplo.com"
                      {...registerForm.register("email", {
                        required: "El email es requerido",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Email inválido",
                        },
                      })}
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-sm font-medium text-destructive">
                        {registerForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Contraseña</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      autoComplete="new-password"
                      {...registerForm.register("password", {
                        required: "La contraseña es requerida",
                        minLength: { value: 8, message: "Mínimo 8 caracteres" },
                        validate: {
                          hasUpper: (v) =>
                            /[A-Z]/.test(v) || "Debe tener una mayúscula",
                          hasLower: (v) =>
                            /[a-z]/.test(v) || "Debe tener una minúscula",
                          hasNumber: (v) =>
                            /[0-9]/.test(v) || "Debe tener un número",
                        },
                      })}
                    />
                    {registerForm.formState.errors.password && (
                      <p className="text-sm font-medium text-destructive">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-confirm">Confirmar contraseña</Label>
                    <Input
                      id="reg-confirm"
                      type="password"
                      autoComplete="new-password"
                      {...registerForm.register("confirmPassword", {
                        required: "Debés confirmar la contraseña",
                        validate: (v) =>
                          v === registerForm.watch("password") ||
                          "Las contraseñas no coinciden",
                      })}
                    />
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="text-sm font-medium text-destructive">
                        {registerForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  {apiError && (
                    <div className="p-3 text-sm font-medium border border-destructive/50 bg-destructive/10 text-destructive rounded-md">
                      ⚠ {apiError}
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creando..." : "Crear cuenta"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
