import { Construction } from "lucide-react";

type VistaPlaceholderProps = {
  titulo: string;
  descripcion: string;
};

export function VistaPlaceholder({ titulo, descripcion }: VistaPlaceholderProps) {
  return (
    <div className="max-w-4xl mx-auto p-6 py-12">
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Construction className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="mb-3 text-gray-800">{titulo}</h2>
        <p className="text-gray-600">{descripcion}</p>
        <p className="text-sm text-gray-500 mt-4">
          Esta sección estará disponible próximamente
        </p>
      </div>
    </div>
  );
}
