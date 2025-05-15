import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  FaLightbulb,
  FaUniversity,
  FaUsers,
  FaChartLine,
  FaReact,
  FaPython,
  FaHandsHelping,
  FaArrowLeft,
} from "react-icons/fa";
import { FaLaptopCode } from "react-icons/fa6";
import { SiTailwindcss } from "react-icons/si";


// Animation variants for container and sections
const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.3 },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};
// Animation variants for cards
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};
// Animation variants for tech cards
const techCardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut", type: "spring", bounce: 0.4 },
  },
};

const About: React.FC = () => {
  // Respect user's reduced motion preference
  const shouldReduceMotion = useReducedMotion();
  const variants = shouldReduceMotion ? {} : containerVariants;
  const navigate = useNavigate();

  // Animation variants for button
  const buttonVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };


  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-gray-800"
    >
      {/* Back Button */}
      <motion.button
        variants={buttonVariants}
        whileHover={
          shouldReduceMotion
            ? {}
            : { scale: 1.05, boxShadow: "0 4px 8px rgba(0, 0, 255, 0.2)" }
        }
        whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
        onClick={() => navigate("/")} // Navigates to main page
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        aria-label="Volver a la página principal"
      >
        <FaArrowLeft className="mr-2 text-lg" />
        Volver
      </motion.button>
      {/* Título principal */}
      <motion.h1
        variants={sectionVariants}
        className="text-3xl sm:text-4xl font-bold text-blue-700 mb-10 text-center"
      >
        Acerca de <span className="text-blue-500">DataInd</span>
      </motion.h1>

      {/* Sección: Descripción */}
      <motion.section variants={sectionVariants} className="mb-12">
        <div className="flex items-center mb-4 text-blue-600 text-xl font-semibold">
          <FaLightbulb className="mr-2" /> ¿Qué es DataInd?
        </div>
        <p className="text-base sm:text-lg leading-relaxed text-justify">
          <strong>DataInd</strong> es una aplicación web desarrollada para la gestión y visualización de indicadores
          estratégicos, operativos y de gestión. Facilita la toma de decisiones basada en datos al centralizar la
          información clave de una organización en una plataforma intuitiva, eficiente y adaptable.
        </p>
        <p className="mt-4 text-base sm:text-lg leading-relaxed text-justify">
          La herramienta permite estructurar procesos en macroprocesos, procesos y subprocesos, vinculando indicadores
          clave y permitiendo su seguimiento y análisis mediante resultados visuales e informes organizados.
          Como guia se cuenta con el siguiente documento que explica el uso de la aplicación y sus
          funcionalidades puedes consultar el <a
            href="https://drive.google.com/file/d/1rJC3_ZBm3h7DsCLJTnHFz6UQNC7zPIi2/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Instructivo de uso
          </a>
        </p>
        
      </motion.section>

      {/* Secciones visuales con íconos */}
      <motion.section variants={containerVariants}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {[
            {
              icon: <FaLightbulb className="text-yellow-400 text-4xl mb-3 mx-auto" />,
              title: "Idea Innovadora",
              text: "Nace como solución tecnológica a la gestión de indicadores en salud u organizaciones.",
            },
            {
              icon: <FaUniversity className="text-blue-500 text-4xl mb-3 mx-auto" />,
              title: "Trabajo de Grado",
              text: "Desarrollada como proyecto de grado en Ingeniería de Software en la Universidad Cooperativa de Colombia.",
            },
            {
              icon: <FaUsers className="text-indigo-500 text-4xl mb-3 mx-auto" />,
              title: "Enfoque Organizacional",
              text: "Dirigida a líderes, analistas y responsables de procesos dentro de cualquier organización.",
            },
            {
              icon: <FaChartLine className="text-green-500 text-4xl mb-3 mx-auto" />,
              title: "Visualización de Indicadores",
              text: "Incluye seguimiento, análisis y reportes visuales de resultados históricos y actuales.",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              variants={sectionVariants}
              whileHover={shouldReduceMotion ? {} : { scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="p-6 bg-white rounded-2xl shadow hover:shadow-md transition"
            >
              {item.icon}
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-sm">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        variants={{
          hidden: { opacity: 0, y: 30 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
        }}
        className="mb-12"
      >
        <div className="flex items-center mb-4 text-blue-600 text-xl font-semibold">
          <FaLaptopCode className="mr-2" /> Tecnologías utilizadas
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-center text-blue-700">
          {[
            {
              icon: <FaReact className="text-4xl mx-auto mb-2" />,
              name: "React",
              description: "Biblioteca de JavaScript para interfaces de usuario dinámicas.",
            },
            {
              icon: <img src="https://vitejs.dev/logo.svg" alt="Vite" className="h-10 mx-auto mb-2" />,
              name: "Vite",
              description: "Herramienta de construcción rápida para proyectos web modernos.",
            },
            {
              icon: <FaPython className="text-4xl mx-auto mb-2" />,
              name: "Python",
              description: "Lenguaje versátil para backend y lógica del servidor.",
            },
            {
              icon: (
                <img
                  src="https://static.djangoproject.com/img/logos/django-logo-negative.svg"
                  alt="Django"
                  className="h-8 mx-auto mb-2"
                />
              ),
              name: "Django",
              description: "Framework de Python para desarrollo web rápido y seguro.",
            },
            {
              icon: <SiTailwindcss className="text-4xl mx-auto mb-2 text-blue-500" />,
              name: "Tailwind CSS",
              description: "Framework CSS para estilos rápidos y personalizables.",
            },
          ].map((tech, index) => (
            <motion.div
              key={index}
              variants={techCardVariants}
              whileHover={
                shouldReduceMotion
                  ? {}
                  : { scale: 1.1, boxShadow: "0 8px 16px rgba(0, 0, 255, 0.2)" }
              }
              transition={{ type: "spring", stiffness: 300 }}
              className="relative bg-white rounded-lg shadow p-4 group"
            >
              {tech.icon}
              <p className="font-medium">{tech.name}</p>
              <div className="absolute bottom-full mb-2 hidden group-hover:block bg-blue-600 text-white text-xs rounded py-1 px-2 w-max max-w-xs z-10">
                {tech.description}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        variants={{
          hidden: { opacity: 0, y: 30 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
        }}
        className="mb-12"
      >
        <div className="flex items-center mb-4 text-blue-600 text-xl font-semibold">
          <FaUniversity className="mr-2" /> Créditos
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Developer Info Card */}
          <motion.div
            variants={cardVariants}
            whileHover={
              shouldReduceMotion
                ? {}
                : { y: -5, boxShadow: "0 8px 16px rgba(0, 0, 255, 0.2)" }
            }
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-gradient-to-br from-white to-blue-50 shadow rounded-lg p-6"
          >
            <div className="flex items-center mb-4">
              <FaUniversity className="text-blue-500 text-2xl mr-2" />
              <h3 className="text-lg font-semibold text-blue-700">Desarrollador</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-800">
              <strong>Edison Stiven Narvaez Paz</strong>
              <br />
              Estudiante de Ingeniería de Software
              <br />
              <span className="relative group">
                Universidad Cooperativa de Colombia
                <span className="absolute bottom-full mb-2 hidden group-hover:block bg-blue-600 text-white text-xs rounded py-1 px-2 w-max max-w-xs z-10">
                  Institución líder en educación superior en Colombia.
                </span>
              </span>
              <br />
              Año: 2025
            </p>
          </motion.div>

          {/* Acknowledgments Card */}
          <motion.div
            variants={cardVariants}
            whileHover={
              shouldReduceMotion
                ? {}
                : { y: -5, boxShadow: "0 8px 16px rgba(0, 0, 255, 0.2)" }
            }
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-gradient-to-br from-white to-blue-50 shadow rounded-lg p-6"
          >
            <div className="flex items-center mb-4">
              <FaHandsHelping className="text-blue-500 text-2xl mr-2" />
              <h3 className="text-lg font-semibold text-blue-700">Agradecimientos</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-800">
              Agradecimientos especiales a <strong>Red Medicron IPS</strong>, a  la epidemióloga{" "}
              <strong>Nury Ximena Trejo</strong>, y al área de calidad de la empresa por su invaluable apoyo durante el desarrollo
              del proyecto.
            </p>
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  );
};

export default About;