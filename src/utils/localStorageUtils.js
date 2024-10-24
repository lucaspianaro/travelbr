// localStorageUtils.js
export const getSavedViewType = () => {
    return localStorage.getItem('viewMode') || 'card';
  };
  
  export const saveViewType = (viewType) => {
    localStorage.setItem('viewMode', viewType);
  };
  