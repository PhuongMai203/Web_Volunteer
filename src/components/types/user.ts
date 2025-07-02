// types/user.ts
export interface UserInfo {
  uid: string;
  fullName: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  birthYear: string;
  rank: string;
  avatarUrl: string;
}
export interface BusinessVerification {
  accountHolder: string;
  accountNumber: string;
  address: string;
  bankName: string;
  branch: string;
  companyName: string;
  idCardBackUrl: string;
  idCardFrontUrl: string;
  idNumber: string;
  license: string;
  logoUrl: string;
  portraitUrl: string;
  position: string;
  representativeName: string;
  stampUrl: string;
  status: string;
  submittedAt: any;
  taxCode: string;
}