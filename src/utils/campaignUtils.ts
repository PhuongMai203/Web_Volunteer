import { removeDiacritics } from "./stringUtils";

export function extractCampaignTitle(originalQuestion: string): string | null {
  if (!originalQuestion || typeof originalQuestion !== "string") {
    return null;
  }

  const normalizedQuestion = removeDiacritics(originalQuestion.toLowerCase());

  const startIndicators = [
    "chiến dịch",
    "về chiến dịch",
    "cho chiến dịch",
    "của chiến dịch",
    "chien dich",
    "ve chien dich",
    "cho chien dich",
    "cua chien dich"
  ];

  const endIndicators = [
    "bao nhieu tien", "la gi", "khi nao", "o dau", "the nao", "con hoat dong khong",
    "ung ho bao nhieu", "bao nhieu nguoi tham gia", "can bao nhieu tinh nguyen vien",
    "mo ta", "thong tin", "dia chi", "loai hinh ho tro", "phuong thuc nhan ho tro",
    "ngan hang", "tai khoan", "ma so thue", "lien he", "ket thuc vao", "bat dau vao",
    "su kien", "ho tro", "tinh nguyen"
  ];

  let potentialTitle = normalizedQuestion;

  let startIndex = -1;
  for (const indicator of startIndicators) {
    const index = normalizedQuestion.indexOf(indicator);
    if (index !== -1) {
      startIndex = index + indicator.length;
      break;
    }
  }

  if (startIndex === -1 && normalizedQuestion.startsWith("chien dich ")) {
    startIndex = "chien dich ".length;
  }

  if (startIndex === -1) {
    return null;
  }

  // Cắt phần sau chỉ dẫn bắt đầu
  potentialTitle = normalizedQuestion.substring(startIndex).trim();

  // Xác định điểm kết thúc tên chiến dịch dựa trên các chỉ dẫn kết thúc
  let endIndex = potentialTitle.length;
  for (const indicator of endIndicators) {
    const index = potentialTitle.indexOf(indicator);
    if (index !== -1 && index < endIndex) {
      endIndex = index;
    }
  }

  // Cắt phần sau tên chiến dịch
  potentialTitle = potentialTitle.substring(0, endIndex).trim();

  // Loại bỏ dấu ngoặc nếu có
  if (
    (potentialTitle.startsWith('"') && potentialTitle.endsWith('"')) ||
    (potentialTitle.startsWith('“') && potentialTitle.endsWith('”'))
  ) {
    potentialTitle = potentialTitle.substring(1, potentialTitle.length - 1).trim();
  }

  // Kiểm tra tên có hợp lệ không (đủ dài, đủ số từ)
  if (potentialTitle.length > 3 && potentialTitle.split(' ').length >= 1) {
    return potentialTitle;
  }

  return null;
}
