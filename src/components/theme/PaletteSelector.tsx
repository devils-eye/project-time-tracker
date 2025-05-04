import { useState } from "react";
import { useTheme, ColorPalette } from "../../context/ThemeContext";

const PaletteSelector = () => {
  const { palette, setPalette } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const palettes: { value: ColorPalette; label: string; color: string }[] = [
    { value: "blue", label: "Blue", color: "var(--blue-primary-500)" },
    { value: "purple", label: "Purple", color: "var(--purple-primary-500)" },
    { value: "green", label: "Green", color: "var(--green-primary-500)" },
    { value: "orange", label: "Orange", color: "var(--orange-primary-500)" },
    { value: "pink", label: "Pink", color: "var(--pink-primary-500)" },
  ];

  const handlePaletteChange = (newPalette: ColorPalette) => {
    setPalette(newPalette);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 p-2 rounded-md bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-primary-100"
        aria-label="Change color palette"
        title="Change color palette"
      >
        <span
          className="w-5 h-5 rounded-full border border-gray-300 dark:border-gray-600"
          style={{
            backgroundColor: palettes.find((p) => p.value === palette)?.color,
          }}
        ></span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 py-2">
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Color Theme
            </h3>
          </div>
          <div className="py-1">
            {palettes.map((p) => (
              <button
                key={p.value}
                onClick={() => handlePaletteChange(p.value)}
                className={`w-full text-left px-4 py-2 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  palette === p.value ? "bg-gray-100 dark:bg-gray-700" : ""
                }`}
              >
                <span
                  className="w-5 h-5 rounded-full border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: p.color }}
                ></span>
                <span className="text-gray-800 dark:text-gray-200">
                  {p.label}
                </span>
                {palette === p.value && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-auto text-primary-600 dark:text-primary-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaletteSelector;
