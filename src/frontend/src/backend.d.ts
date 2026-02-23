import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Receipt {
    id: bigint;
    status: ReceiptStatus;
    total: bigint;
    balance: bigint;
    payments: Array<Payment>;
    customer: Customer;
    date: Time;
    number: string;
    items: Array<LineItem>;
}
export type Time = bigint;
export interface LineItem {
    serviceItem: ServiceItem;
    total: bigint;
    quantity: bigint;
}
export type PaymentMethod = {
    __kind__: "other";
    other: string;
} | {
    __kind__: "card";
    card: null;
} | {
    __kind__: "cash";
    cash: null;
} | {
    __kind__: "bankTransfer";
    bankTransfer: null;
};
export interface ServiceItem {
    name: string;
    price: bigint;
}
export interface Payment {
    id: bigint;
    method: PaymentMethod;
    date: Time;
    notes: string;
    amount: bigint;
}
export interface BusinessProfile {
    name: string;
    email: string;
    address: string;
    phone: string;
}
export interface Customer {
    contact: string;
    name: string;
}
export interface UserProfile {
    name: string;
    email: string;
}
export enum ReceiptStatus {
    open = "open",
    paid = "paid",
    partial = "partial"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCustomer(customer: Customer): Promise<void>;
    addPayment(receiptId: bigint, payment: Payment): Promise<void>;
    addServiceItem(item: ServiceItem): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createReceipt(number: string, customer: Customer, items: Array<LineItem>, total: bigint): Promise<bigint>;
    getBusinessProfile(): Promise<BusinessProfile | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCustomers(): Promise<Array<Customer>>;
    getReceiptPayments(receiptId: bigint): Promise<Array<Payment>>;
    getReceipts(): Promise<Array<Receipt>>;
    getReceiptsSorted(sortBy: string): Promise<Array<Receipt>>;
    getServiceItems(): Promise<Array<ServiceItem>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveBusinessProfile(profile: BusinessProfile): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
