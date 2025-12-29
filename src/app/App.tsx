import { useState } from "react";
import { Navbar } from "./components/Navbar";
import { Inicio } from "./components/Inicio";
import { RegistroDeportista } from "./components/RegistroDeportista";
import { HistoriaClinica } from "./components/HistoriaClinica";
import { SelectDeportista } from "./components/SelectDeportista";
import { GestionCitas } from "./components/GestionCitas";
import { VistaPlaceholder } from "./components/VistaPlaceholder";

type Deportista = {
  id: string;
  foto: string | null;
  nombreCompleto: string;
  numeroDocumento: string;
  tipoDocumento: string;
  edad: number;
  tipoDeporte: string;
  nivelCompetencia: string;
};

export default function App() {
  const [currentView, setCurrentView] = useState("inicio");
  const [selectedDeportista, setSelectedDeportista] = useState<Deportista | null>(null);

  const handleSelectDeportista = (deportista: Deportista) => {
    setSelectedDeportista(deportista);
    setCurrentView("historia-form");
  };

  const handleBackToSelect = () => {
    setSelectedDeportista(null);
    setCurrentView("historia");
  };

  const renderView = () => {
    switch (currentView) {
      case "inicio":
        return <Inicio onNavigate={setCurrentView} />;
      case "registro":
        return <RegistroDeportista />;
      case "historia":
        return (
          <SelectDeportista
            onSelectDeportista={handleSelectDeportista}
            onBack={() => setCurrentView("inicio")}
          />
        );
      case "historia-form":
        return selectedDeportista ? (
          <HistoriaClinica
            deportista={selectedDeportista}
            onBack={handleBackToSelect}
          />
        ) : (
          <SelectDeportista
            onSelectDeportista={handleSelectDeportista}
            onBack={() => setCurrentView("inicio")}
          />
        );
      case "deportistas":
        return (
          <VistaPlaceholder
            titulo="Lista de Deportistas"
            descripcion="Aquí podrás ver y gestionar todos los deportistas registrados en el sistema."
          />
        );
      case "consultas":
        return <GestionCitas />;
      case "configuracion":
        return (
          <VistaPlaceholder
            titulo="Configuración"
            descripcion="Configura los parámetros del sistema y gestiona usuarios."
          />
        );
      default:
        return <Inicio onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar onNavigate={setCurrentView} currentView={currentView} />
      {renderView()}
    </div>
  );
}