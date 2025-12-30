type VistaPlaceholderProps = {
  titulo: string;
  descripcion: string;
};

export function VistaPlaceholder({ titulo, descripcion }: VistaPlaceholderProps) {
  return (
    <div className="max-w-4xl mx-auto p-6 py-12">
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-[#C84F3B] to-[#1F4788] rounded-full mx-auto mb-6 flex items-center justify-center">
            <svg 
              className="w-10 h-10 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
              />
            </svg>
          </div>
          
          <h1 className="text-gray-800 mb-4">{titulo}</h1>
          
          <p className="text-gray-600 mb-8">
            {descripcion}
          </p>
          
          <div className="inline-block px-6 py-3 bg-gray-100 text-gray-500 rounded-lg text-sm">
            Próximamente disponible
          </div>
        </div>
      </div>
    </div>
  );
}
