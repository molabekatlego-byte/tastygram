import React from 'react';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <select
      value={selectedCategory}
      onChange={e => onSelectCategory(e.target.value)}
      style={{
        padding: '0.5rem 1rem',
        fontSize: '1rem',
        borderRadius: '6px',
        border: '1px solid #ccc',
        cursor: 'pointer',
      }}
    >
      <option value="">All Categories</option>
      {categories.map(cat => (
        <option key={cat} value={cat}>
          {cat}
        </option>
      ))}
    </select>
  );
};

export default CategoryFilter;