import React, { useState } from 'react';
import axios from 'axios';

const MacroProcessForm: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    department: '',
    code: '',
    version: '',
    status: true,
  });

  const [isOpen, setIsOpen] = useState(false); // Control del modal

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/macroprocesses/', form);
      if (response.status === 201) {
        alert('Macroproceso creado exitosamente');
        setIsOpen(false); // Cierra el modal después de enviar el formulario
      }
    } catch (error) {
      console.error('Error al enviar los datos', error);
    }
  };

  return (
    <div>
      {/* Botón para abrir el modal */}
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"
      >
        Agregar nuevo MacroProceso
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Fondo oscuro */}
          <div className="fixed inset-0 bg-black opacity-50" onClick={() => setIsOpen(false)}></div>

          {/* Contenido del modal */}
          <div className="bg-white p-6 rounded-lg z-50 w-1/2">
            <h2 className="text-2xl font-bold mb-4">Agregar nuevo MacroProceso</h2>
            <form onSubmit={handleSubmit} className="mb-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Campos del formulario */}
                <div>
                  <label htmlFor="name">Nombre</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description">Descripción</label>
                  <input
                    type="text"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="department">Área</label>
                  <input
                    type="text"
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="code">Código</label>
                  <input
                    type="text"
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="version">Versión</label>
                  <input
                    type="text"
                    name="version"
                    value={form.version}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="status">Estado</label>
                  <select
                    name="status"
                    value={form.status ? 'true' : 'false'}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full"
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="mt-4 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="mt-4 ml-4 px-4 py-2 bg-gray-600 text-white hover:bg-gray-700"
              >
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MacroProcessForm;
