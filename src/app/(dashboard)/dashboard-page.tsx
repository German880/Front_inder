'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  Users,
  Calendar,
  FileText,
  LogOut,
  Activity,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Clock,
} from 'lucide-react';

interface DashboardStats {
  totalDeportistas: number;
  historiasCinicas: number;
  citasProximas: number;
  archivosSubidos: number;
  actividadReciente: ActivityItem[];
  proximasActividades: ActivityItem[];
}

interface ActivityItem {
  id: string;
  tipo: 'cita' | 'historia' | 'archivo' | 'deportista';
  descripcion: string;
  fecha: string;
  icon: React.ReactNode;
  color: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalDeportistas: 0,
    historiasCinicas: 0,
    citasProximas: 0,
    archivosSubidos: 0,
    actividadReciente: [],
    proximasActividades: [],
  });

  // Cargar datos al montar
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setIsLoading(true);

      // Obtener usuario del localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }

      // TODO: Reemplazar con llamadas a API reales
      // Por ahora usamos datos de ejemplo
      const datosEjemplo: DashboardStats = {
        totalDeportistas: 45,
        historiasCinicas: 120,
        citasProximas: 8,
        archivosSubidos: 342,
        actividadReciente: [
          {
            id: '1',
            tipo: 'cita',
            descripcion: 'Nueva cita creada - Juan Pérez',
            fecha: 'Hace 2 horas',
            icon: <Calendar className="w-5 h-5" />,
            color: 'bg-blue-100 text-blue-700',
          },
          {
            id: '2',
            tipo: 'historia',
            descripcion: 'Historia clínica completada - María García',
            fecha: 'Hace 4 horas',
            icon: <FileText className="w-5 h-5" />,
            color: 'bg-green-100 text-green-700',
          },
          {
            id: '3',
            tipo: 'archivo',
            descripcion: 'Archivo subido - Resonancia.pdf',
            fecha: 'Hace 6 horas',
            icon: <Activity className="w-5 h-5" />,
            color: 'bg-purple-100 text-purple-700',
          },
          {
            id: '4',
            tipo: 'deportista',
            descripcion: 'Nuevo deportista registrado - Carlos López',
            fecha: 'Ayer',
            icon: <Users className="w-5 h-5" />,
            color: 'bg-orange-100 text-orange-700',
          },
        ],
        proximasActividades: [
          {
            id: '1',
            tipo: 'cita',
            descripcion: 'Cita con Juan Pérez - Evaluación física',
            fecha: 'Hoy 14:30',
            icon: <Clock className="w-5 h-5" />,
            color: 'bg-blue-100 text-blue-700',
          },
          {
            id: '2',
            tipo: 'cita',
            descripcion: 'Cita con Ana Martínez - Seguimiento',
            fecha: 'Mañana 10:00',
            icon: <Clock className="w-5 h-5" />,
            color: 'bg-blue-100 text-blue-700',
          },
          {
            id: '3',
            tipo: 'cita',
            descripcion: 'Cita con Pedro González - Reevaluación',
            fecha: 'Mañana 15:00',
            icon: <Clock className="w-5 h-5" />,
            color: 'bg-blue-100 text-blue-700',
          },
        ],
      };

      setStats(datosEjemplo);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const navegarA = (ruta: string) => {
    router.push(ruta);
  };

  // Cards de estadísticas
  const statCards = [
    {
      title: 'Total Deportistas',
      value: stats.totalDeportistas,
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      route: '/deportistas',
      increase: '+5 este mes',
    },
    {
      title: 'Historias Clínicas',
      value: stats.historiasCinicas,
      icon: FileText,
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      route: '/historia-clinica',
      increase: '+12 este mes',
    },
    {
      title: 'Citas Próximas',
      value: stats.citasProximas,
      icon: Calendar,
      color: 'orange',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      route: '/citas',
      increase: '+3 esta semana',
    },
    {
      title: 'Archivos',
      value: stats.archivosSubidos,
      icon: Activity,
      color: 'purple',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      route: '/archivos',
      increase: '+45 este mes',
    },
  ];

  const colorMap = {
    blue: {
      text: 'text-blue-600',
      icon: 'text-blue-600',
    },
    green: {
      text: 'text-green-600',
      icon: 'text-green-600',
    },
    orange: {
      text: 'text-orange-600',
      icon: 'text-orange-600',
    },
    purple: {
      text: 'text-purple-600',
      icon: 'text-purple-600',
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Bienvenido, {user?.nombre || 'Usuario'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cards de Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            const colors = colorMap[card.color as keyof typeof colorMap];

            return (
              <div
                key={idx}
                onClick={() => navegarA(card.route)}
                className={`${card.bgColor} border ${card.borderColor} rounded-xl p-6 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {card.title}
                    </p>
                    <p className={`text-3xl font-bold ${colors.text} mt-1`}>
                      {card.value}
                    </p>
                  </div>
                  <Icon className={`w-12 h-12 ${colors.icon} opacity-70`} />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 border-opacity-50">
                  <p className="text-xs text-gray-600">{card.increase}</p>
                  <ArrowRight className={`w-4 h-4 ${colors.text} opacity-50`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Panel de Acciones Rápidas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Acciones Rápidas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navegarA('/deportistas/nuevo')}
              className="group flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-300 font-semibold"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              Registrar Deportista
            </button>

            <button
              onClick={() => navegarA('/deportistas')}
              className="group flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-all duration-300 font-semibold"
            >
              <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Ver Deportistas
            </button>

            <button
              onClick={() => navegarA('/historia-clinica')}
              className="group flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all duration-300 font-semibold"
            >
              <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Historia Clínica
            </button>

            <button
              onClick={() => navegarA('/reportes')}
              className="group flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-lg transition-all duration-300 font-semibold"
            >
              <BarChart3 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Ver Reportes
            </button>
          </div>
        </div>

        {/* Dos columnas: Actividad Reciente y Próximas Actividades */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Actividad Reciente */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Actividad Reciente
            </h3>

            <div className="space-y-4">
              {stats.actividadReciente.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className={`${item.color} p-3 rounded-lg flex-shrink-0`}>
                    {item.icon}
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {item.descripcion}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{item.fecha}</p>
                  </div>

                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                </div>
              ))}
            </div>

            <button
              onClick={() => navegarA('/deportistas')}
              className="w-full mt-6 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold"
            >
              Ver Más
            </button>
          </div>

          {/* Próximas Actividades */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              Próximas Citas
            </h3>

            <div className="space-y-4">
              {stats.proximasActividades.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg hover:shadow-md transition"
                >
                  <div className={`${item.color} p-3 rounded-lg flex-shrink-0`}>
                    {item.icon}
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {item.descripcion}
                    </p>
                    <p className="text-xs text-gray-600 mt-1 font-semibold">
                      {item.fecha}
                    </p>
                  </div>

                  <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                </div>
              ))}
            </div>

            <button
              onClick={() => navegarA('/citas')}
              className="w-full mt-6 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold"
            >
              Ver Todas las Citas
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <Activity className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">
                Sistema INDERDB v1.0
              </h4>
              <p className="text-sm text-blue-800">
                Plataforma de gestión médica deportiva integrada. Para reportar
                problemas o sugerencias, contacta al equipo de soporte.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
