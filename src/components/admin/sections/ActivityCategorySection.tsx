import { Section } from "../dashboard/settings/FormElements";
import { useState } from "react";

export default function ActivityCategorySection({ 
  categories, 
  setCategories 
}: { 
  categories: any[]; 
  setCategories: React.Dispatch<React.SetStateAction<any[]>>;
}) {
  const [newCategory, setNewCategory] = useState('');

  const addCategory = () => {
    if (newCategory.trim() !== '') {
      const newCat = {
        id: Date.now(),
        name: newCategory.trim()
      };
      setCategories([...categories, newCat]);
      setNewCategory('');
    }
  };

  const deleteCategory = (id: number) => {
    setCategories(categories.filter(cat => cat.id !== id));
  };

  return (
    <Section title="Quản lý danh mục hoạt động">
      <div className="flex mb-4">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Thêm danh mục mới..."
          className="flex-1 p-2 border border-orange-300 rounded-l focus:outline-none"
        />
        <button
          onClick={addCategory}
          className="bg-orange-500 text-white px-4 py-2 rounded-r hover:bg-orange-600"
        >
          Thêm
        </button>
      </div>
      
      <div className="border border-orange-200 rounded-lg overflow-hidden">
        {categories.map(category => (
          <div key={category.id} className="flex justify-between items-center p-3 border-b border-orange-200 last:border-b-0">
            <span>{category.name}</span>
            <button
              onClick={() => deleteCategory(category.id)}
              className="text-red-500 hover:text-red-700"
            >
              Xóa
            </button>
          </div>
        ))}
      </div>
    </Section>
  );
}