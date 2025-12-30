import { useState } from "react";
import { Menu, House, ClipboardList, Users, Activity, Settings, X, FileHeart } from "lucide-react";
import logo from "figma:asset/de8336eabd75e8b9a8007285a47658c227013688.png";

type NavbarProps = {
  onNavigate: (view: string) => void;
  currentView: string;
};

export function Navbar({ onNavigate, currentView }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { id: "inicio", label: "Inicio", icon: House },
    { id: "registro", label: "Registro de Deportistas", icon: ClipboardList },
    { id: "historia", label: "Historia Clínica", icon: FileHeart },
    { id: "deportistas", label: "Lista de Deportistas", icon: Users },
    { id: "consultas", label: "Agendamiento de Citas", icon: Activity },
    { id: "configuracion", label: "Configuración", icon: Settings },
  ];

  const handleMenuClick = (viewId: string) => {
    onNavigate(viewId);
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="flex items-center h-16 px-4">
          {/* Botón menú hamburguesa */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-md hover:bg-[#F5F7FA] transition-colors"
            aria-label="Menú"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>

          {/* Logo y nombre */}
          <div className="flex items-center gap-3 ml-4">
            <img src={logo} alt="INDERHuila" className="h-10 w-auto" />
            <div className="flex flex-col">
              <span className="font-semibold text-gray-800 leading-tight">INDERHuila</span>
              <span className="text-xs text-gray-500">Sistema Médico Deportivo</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Menú desplegable lateral */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMenuOpen(false)}
      >
        <div
          className={`fixed left-0 top-0 h-full w-72 bg-white shadow-xl transform transition-transform duration-300 flex flex-col ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header del menú */}
          <div className="bg-gradient-to-r from-[#C84F3B] to-[#A23E2D] p-6 text-white flex-shrink-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white p-1.5 rounded-lg">
                <img src={logo} alt="INDERHuila" className="h-9 w-auto" />
              </div>
              <div>
                <h2 className="font-bold text-lg">INDERHuila</h2>
                <p className="text-sm text-white/90">Menú de navegación</p>
              </div>
            </div>
          </div>

          {/* Items del menú - Con scroll si es necesario */}
          <nav className="py-4 flex-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full flex items-center gap-3 px-6 py-3 transition-colors ${
                    isActive
                      ? "bg-[#F5F7FA] text-[#C84F3B] border-l-4 border-[#C84F3B]"
                      : "text-gray-700 hover:bg-[#F5F7FA] border-l-4 border-transparent"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-[#C84F3B]" : "text-gray-500"}`} />
                  <span className={isActive ? "font-semibold" : ""}>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Footer del menú */}
          <div className="p-4 border-t border-[#E6E9ED] bg-[#F5F7FA] flex-shrink-0">
            <p className="text-xs text-gray-500 text-center">
              Sistema de Historias Clínicas
              <br />
              Versión 1.0.0
            </p>
          </div>
        </div>
      </div>
    </>
  );
}