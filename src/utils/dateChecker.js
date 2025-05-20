export function checkDateStatus(backendDateStr) {
  const givenDate = new Date(backendDateStr);
  const today = new Date();

  // Faqat sanani solishtirish (soat emas)
  const isExpired = givenDate < new Date(today.toDateString());

  return isExpired ? "Muddati o‘tgan" : "Aktiv";
}

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 0-based index for months
  const year = date.getFullYear();
  
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}.${month}.${year} ${hours}:${minutes}`;
};