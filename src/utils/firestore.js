import { supabase } from '../lib/firebase';
import { DEMO_CATEGORIES, DEMO_DISHES } from '../data/demoMenu';

// ── Initialize Supabase with demo data if empty ──────────────────────────────
export async function initializeDemoData() {
  try {
    // Check if dishes table has data
    const { data: dishes, error: dishesError } = await supabase
      .from('dishes')
      .select('id')
      .limit(1);

    if (dishesError) throw dishesError;

    // If empty, seed with demo data
    if (!dishes || dishes.length === 0) {
      await supabase.from('dishes').insert(
        DEMO_DISHES.map(d => ({
          id: d.id,
          name: d.name,
          description: d.description,
          category: d.category,
          price: d.price,
          isVeg: d.isVeg,
          isAvailable: d.isAvailable !== false,
          imageURL: d.imageURL,
          modelURL: d.modelURL,
        }))
      );
    }

    // Check if categories table has data
    const { data: categories, error: catsError } = await supabase
      .from('categories')
      .select('id')
      .limit(1);

    if (catsError) throw catsError;

    // If empty, seed categories
    if (!categories || categories.length === 0) {
      await supabase.from('categories').insert(
        DEMO_CATEGORIES.map(c => ({
          id: c.id,
          name: c.name,
          order: c.order || 0,
        }))
      );
    }
  } catch (err) {
    console.warn('Failed to initialize demo data:', err);
  }
}

// ── Real-time listeners ───────────────────────────────────────────────────────
export function onDishesChange(callback) {
  const channel = supabase
    .channel('dishes-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'dishes' },
      async () => {
        // Re-fetch all dishes when any change happens
        const { data, error } = await supabase.from('dishes').select('*');
        if (!error && data) {
          callback(data);
        }
      }
    )
    .subscribe();

  // Also fetch initial data
  supabase.from('dishes').select('*').then(({ data, error }) => {
    if (!error && data) {
      callback(data);
    }
  });

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
}

export function onAvailableDishesChange(callback) {
  const channel = supabase
    .channel('available-dishes-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'dishes' },
      async () => {
        // Re-fetch available dishes when any change happens
        const { data, error } = await supabase
          .from('dishes')
          .select('*')
          .eq('isavailable', true);  // lowercase column name
        if (!error && data) {
          console.log('✅ Dishes fetched from Supabase:', data.length);
          callback(data);
        } else if (error) {
          console.error('❌ Error fetching dishes:', error);
        }
      }
    )
    .subscribe();

  // Also fetch initial data
  supabase
    .from('dishes')
    .select('*')
    .eq('isavailable', true)  // lowercase column name
    .then(({ data, error }) => {
      if (!error && data) {
        console.log('✅ Initial dishes loaded:', data.length);
        callback(data);
      } else if (error) {
        console.error('❌ Error loading initial dishes:', error);
      }
    });

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
}

export function onCategoriesChange(callback) {
  const channel = supabase
    .channel('categories-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'categories' },
      async () => {
        // Re-fetch all categories when any change happens
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('order', { ascending: true });
        if (!error && data) {
          console.log('✅ Categories fetched from Supabase:', data.length);
          callback(data);
        } else if (error) {
          console.error('❌ Error fetching categories:', error);
        }
      }
    )
    .subscribe();

  // Also fetch initial data
  supabase
    .from('categories')
    .select('*')
    .order('order', { ascending: true })
    .then(({ data, error }) => {
      if (!error && data) {
        console.log('✅ Initial categories loaded:', data.length);
        callback(data);
      } else if (error) {
        console.error('❌ Error loading initial categories:', error);
      }
    });

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
}

// ── Dishes ────────────────────────────────────────────────────────────────────
export async function fetchDishes() {
  try {
    const { data, error } = await supabase.from('dishes').select('*');
    if (error) {
      console.error('Error fetching dishes:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('Exception fetching dishes:', err);
    return [];
  }
}

export async function fetchAvailableDishes() {
  try {
    const { data, error } = await supabase
      .from('dishes')
      .select('*')
      .eq('isavailable', true);  // lowercase column name
    if (error) {
      console.error('Error fetching available dishes:', error);
      return [];
    }
    console.log('✅ Fetched available dishes:', data?.length || 0);
    return data || [];
  } catch (err) {
    console.error('Exception fetching available dishes:', err);
    return [];
  }
}

export async function addDish(data) {
  const newDish = {
    name: data.name,
    description: data.description,
    category: data.category,
    price: data.price,
    isveg: data.isVeg,  // lowercase
    isavailable: true,  // lowercase
    imageurl: data.imageURL,  // lowercase
    modelurl: data.modelURL,  // lowercase
  };

  const { data: result, error } = await supabase
    .from('dishes')
    .insert([newDish])
    .select();

  if (error) {
    console.error('Error adding dish:', error);
    throw error;
  }

  return result?.[0] || newDish;
}

export async function updateDish(id, data) {
  const { error } = await supabase
    .from('dishes')
    .update(data)
    .eq('id', id);

  if (error) {
    console.error('Error updating dish:', error);
    throw error;
  }
}

export async function toggleDishAvailability(id, isAvailable) {
  await updateDish(id, { isavailable: isAvailable });  // lowercase
}

export async function deleteDish(id) {
  const { error } = await supabase.from('dishes').delete().eq('id', id);

  if (error) {
    console.error('Error deleting dish:', error);
    throw error;
  }
}

// ── Categories ────────────────────────────────────────────────────────────────
export async function fetchCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('order', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data || [];
}

export async function addCategory(data) {
  const newCat = {
    name: data.name,
    order: data.order || 0,
  };

  const { data: result, error } = await supabase
    .from('categories')
    .insert([newCat])
    .select();

  if (error) {
    console.error('Error adding category:', error);
    throw error;
  }

  return result?.[0] || newCat;
}

export async function updateCategory(id, data) {
  const { error } = await supabase
    .from('categories')
    .update(data)
    .eq('id', id);

  if (error) {
    console.error('Error updating category:', error);
    throw error;
  }
}

export async function deleteCategory(id) {
  const { error } = await supabase.from('categories').delete().eq('id', id);

  if (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}

// ── File uploads ──────────────────────────────────────────────────────────────
export async function uploadFile(file, path) {
  const fileName = `${Date.now()}_${file.name}`;
  const filePath = `${path}/${fileName}`;

  const { error } = await supabase.storage
    .from('menu-files')
    .upload(filePath, file);

  if (error) {
    console.error('Error uploading file:', error);
    throw error;
  }

  // Get public URL
  const { data } = supabase.storage.from('menu-files').getPublicUrl(filePath);
  return data?.publicUrl;
}

export async function deleteFile(fileURL) {
  try {
    // Extract path from URL
    const url = new URL(fileURL);
    const filePath = url.pathname.split('/menu-files/')[1];

    if (filePath) {
      await supabase.storage.from('menu-files').remove([filePath]);
    }
  } catch (err) {
    console.warn('Failed to delete file:', err);
  }
}

// ── Legacy stubs ──────────────────────────────────────────────────────────────
export async function getRestaurant() {
  return null;
}

export async function setRestaurant() {}
