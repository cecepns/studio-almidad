export const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const truncateText = (text, maxLength = 160) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const stripHtml = (html) => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};