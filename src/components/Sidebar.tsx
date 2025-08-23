"use client";

import { motion } from "framer-motion";

interface SidebarProps {
  onToggleAddingPoints: () => void;
  onToggleAddingCurves: () => void;
  onClearChart: () => void;
  onRestartAnimations: () => void;
  isAddingPoints: boolean;
  isAddingCurves: boolean;
  pointsCount: number;
  linesCount: number;
  curvesCount: number;
}

export const Sidebar = ({
  onToggleAddingPoints,
  onToggleAddingCurves,
  onClearChart,
  onRestartAnimations,
  isAddingPoints,
  isAddingCurves,
  pointsCount,
  linesCount,
  curvesCount,
}: SidebarProps) => {
  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-80 bg-white border-r border-gray-200 p-6 shadow-lg"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Easy Charts</h2>
          <p className="text-gray-600 text-sm">
            Crie gráficos bonitos com animações
          </p>
        </div>

        {/* Stats */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-700 mb-3">Estatísticas</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Pontos:</span>
              <span className="font-medium text-blue-600">{pointsCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Linhas:</span>
              <span className="font-medium text-green-600">{linesCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Curvas:</span>
              <span className="font-medium text-purple-600">{curvesCount}</span>
            </div>
          </div>
        </div>

        {/* Add Points Mode */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700">Adicionar Pontos</h3>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onToggleAddingPoints}
            className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
              isAddingPoints
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isAddingPoints
              ? "🖱️ Modo Ativo - Clique para Desativar"
              : "➕ Ativar Modo de Adição"}
          </motion.button>

          {isAddingPoints && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-lg p-3"
            >
              <p className="text-sm text-green-700">
                <strong>Modo ativo!</strong> Clique no gráfico para adicionar
                pontos automaticamente.
              </p>
            </motion.div>
          )}
        </div>

        {/* Add Curves Mode */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700">Adicionar Curvas</h3>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onToggleAddingCurves}
            disabled={linesCount === 0}
            className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
              isAddingCurves
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : linesCount === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-purple-600 text-white hover:bg-purple-700"
            }`}
          >
            {isAddingCurves
              ? "🎯 Modo Ativo - Clique para Desativar"
              : "🔄 Adicionar Curva"}
          </motion.button>

          {isAddingCurves && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-purple-50 border border-purple-200 rounded-lg p-3"
            >
              <p className="text-sm text-purple-700">
                <strong>Modo ativo!</strong> Clique em uma linha para adicionar
                pontos de controle. Você pode adicionar vários pontos para criar
                curvas complexas!
              </p>
            </motion.div>
          )}

          {linesCount === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-700">
                <strong>Dica:</strong> Adicione pelo menos uma linha antes de
                criar curvas.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700">Ações</h3>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRestartAnimations}
            disabled={pointsCount === 0}
            className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
              pointsCount === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-orange-600 text-white hover:bg-orange-700"
            }`}
          >
            🔄 Reiniciar Animações
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClearChart}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md font-medium hover:bg-red-700 transition-colors"
          >
            Limpar Gráfico
          </motion.button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Como usar:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Clique em "Ativar Modo de Adição" para pontos</li>
            <li>• Clique no gráfico para adicionar pontos</li>
            <li>• Use "Adicionar Curva" para criar curvas</li>
            <li>• Clique em uma linha para adicionar pontos de controle</li>
            <li>• Adicione vários pontos para curvas complexas</li>
            <li>• Arraste os pontos para ajustar a curvatura</li>
            <li>• Após 2 pontos, uma linha animada será criada</li>
            <li>• Clique nos pontos para interagir</li>
            <li>• Use "Reiniciar Animações" para ver novamente</li>
            <li>• Use "Limpar Gráfico" para resetar tudo</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};
