import React from 'react';
import { getIconComponent } from '../lib/categoryIcons';
import { useLanguage } from '../contexts/LanguageContext';

interface CategoryCardProps {
  category: {
    id: string;
    name_de: string;
    name_fr: string;
    name_ln: string;
    icon: string;
    parent_id: string | null;
    subcategories?: any[];
  };
  onClick: (categoryId: string) => void;
  isSelected?: boolean;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick, isSelected }) => {
  const { language } = useLanguage();
  const Icon = getIconComponent(category.icon);

  const getCategoryName = (): string => {
    switch (language) {
      case 'de': return category.name_de;
      case 'fr': return category.name_fr;
      case 'ln': return category.name_ln;
      default: return category.name_de;
    }
  };

  return (
    <button
      onClick={() => onClick(category.id)}
      className={`group flex flex-col items-center p-6 bg-white rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:border-[#0A5EB0] ${
        isSelected ? 'border-[#0A5EB0] shadow-lg' : 'border-[#E5E5E5]'
      }`}
    >
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${
          isSelected
            ? 'bg-[#0A5EB0] text-white'
            : 'bg-[#E5E5E5] text-[#1C1C1C] group-hover:bg-[#0A5EB0] group-hover:text-white'
        }`}
      >
        <Icon className="w-8 h-8" />
      </div>
      <span
        className={`text-sm font-semibold text-center transition-colors ${
          isSelected ? 'text-[#0A5EB0]' : 'text-[#1C1C1C] group-hover:text-[#0A5EB0]'
        }`}
      >
        {getCategoryName()}
      </span>
      {category.subcategories && category.subcategories.length > 0 && (
        <span className="text-xs text-gray-500 mt-1">
          {category.subcategories.length} {language === 'de' ? 'Unterkategorien' : language === 'fr' ? 'sous-catégories' : 'ba sous-catégories'}
        </span>
      )}
    </button>
  );
};
