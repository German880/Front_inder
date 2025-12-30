import { useState } from "react";
import { toast } from "sonner";

import { CatalogosProvider } from "./contexts/CatalogosContext";
import Navbar from "./components/Navbar";
import { Inicio } from "./components/Inicio";
import { RegistroDeportista } from "./components/RegistroDeportista";
import { HistoriaClinica } from "./components/HistoriaClinica";
import { SelectDeportista } from "./components/SelectDeportista";
import { CitasManager } from "./components/CitasManager";
import { ListadoDeportistas } from "./components/ListadoDeportistas";
import { DetalleDeportista } from "./components/DetalleDeportista";
import { deportistasService, Deportista } from "./services/apiClient";

export default function App() {
  const [currentView, setCurrentView] = useState("inicio");
  const [selectedDeportista, setSelectedDeportista] = useState<Deportista | null>(null);
  const [selectedDeportistaId, setSelectedDeportistaId] = useState<string | null>(null);

  const handleSelectDeportista = (deportista: Deportista) => {
    setSelectedDeportista(deportista);
    setSelectedDeportistaId(deportista.id); // Agregar esta línea
    setCurrentView("historia-form");
  };

  const handleBackToSelect = () => {
    setSelectedDeportista(null);
    setCurrentView("historia");
  };

  const handleRegistroSubmit = async (data: any) => {
    try {
      await deportistasService.create(data);
      toast.success("Deportista registrado correctamente");
      setCurrentView("historia");
    } catch (error) {
      toast.error("Error al registrar deportista");
      console.error("Error registrando deportista:", error);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case "inicio":
        return <Inicio onNavigate={setCurrentView} />;
      case "registro":
        return <RegistroDeportista onSubmit={handleRegistroSubmit} />;
      case "historia":
        return (
          <SelectDeportista
            onSelect={handleSelectDeportista}
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
            onSelect={handleSelectDeportista}
          />
        );
      case "deportistas":
        return <ListadoDeportistas />;
      case "detalles-deportista":
        return selectedDeportistaId ? (
          <DetalleDeportista deportistaId={selectedDeportistaId} />
        ) : (
          <ListadoDeportistas />
        );
      case "consultas":
        return <CitasManager />;
      case "configuracion":
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold">Configuración</h1>
            <p className="text-gray-600">Configura los parámetros del sistema y gestiona usuarios.</p>
          </div>
        );
      default:
        return <Inicio onNavigate={setCurrentView} />;
    }
  };

  return (
    <CatalogosProvider>
      <div className="min-h-screen bg-slate-50">
        <Navbar onNavigate={setCurrentView} currentView={currentView} />
        {renderView()}
      </div>
    </CatalogosProvider>
  );
}