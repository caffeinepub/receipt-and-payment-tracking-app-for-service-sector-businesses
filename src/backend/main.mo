import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Order "mo:core/Order";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
    email : Text;
  };

  public type BusinessProfile = {
    name : Text;
    address : Text;
    email : Text;
    phone : Text;
  };

  public type Customer = {
    name : Text;
    contact : Text;
  };

  public type ServiceItem = {
    name : Text;
    price : Nat;
  };

  public type LineItem = {
    serviceItem : ServiceItem;
    quantity : Nat;
    total : Nat;
  };

  public type PaymentMethod = {
    #cash;
    #card;
    #bankTransfer;
    #other : Text;
  };

  public type Payment = {
    id : Nat;
    amount : Nat;
    date : Time.Time;
    method : PaymentMethod;
    notes : Text;
  };

  public type ReceiptStatus = {
    #open;
    #partial;
    #paid;
  };

  public type Receipt = {
    id : Nat;
    number : Text;
    date : Time.Time;
    customer : Customer;
    items : [LineItem];
    total : Nat;
    payments : [Payment];
    status : ReceiptStatus;
    balance : Nat;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let businessProfiles = Map.empty<Principal, BusinessProfile>();
  let customers = Map.empty<Principal, List.List<Customer>>();
  let serviceItems = Map.empty<Principal, List.List<ServiceItem>>();
  let receipts = Map.empty<Principal, List.List<Receipt>>();

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Business Profile Management
  public shared ({ caller }) func saveBusinessProfile(profile : BusinessProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save business profiles");
    };
    businessProfiles.add(caller, profile);
  };

  public query ({ caller }) func getBusinessProfile() : async ?BusinessProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view business profiles");
    };
    businessProfiles.get(caller);
  };

  // Customer Management
  public shared ({ caller }) func addCustomer(customer : Customer) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add customers");
    };
    if (not customers.containsKey(caller)) {
      customers.add(caller, List.empty<Customer>());
    };
    let currentCustomers = switch (customers.get(caller)) {
      case (null) { List.empty<Customer>() };
      case (?list) { list };
    };
    currentCustomers.add(customer);
  };

  public query ({ caller }) func getCustomers() : async [Customer] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view customers");
    };
    switch (customers.get(caller)) {
      case (null) { [] };
      case (?list) { list.toArray() };
    };
  };

  // Service Item Management
  public shared ({ caller }) func addServiceItem(item : ServiceItem) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add service items");
    };
    if (not serviceItems.containsKey(caller)) {
      serviceItems.add(caller, List.empty<ServiceItem>());
    };
    let currentItems = switch (serviceItems.get(caller)) {
      case (null) { List.empty<ServiceItem>() };
      case (?list) { list };
    };
    currentItems.add(item);
  };

  public query ({ caller }) func getServiceItems() : async [ServiceItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view service items");
    };
    switch (serviceItems.get(caller)) {
      case (null) { [] };
      case (?list) { list.toArray() };
    };
  };

  // Receipt Management
  public shared ({ caller }) func createReceipt(number : Text, customer : Customer, items : [LineItem], total : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create receipts");
    };

    let newReceiptId = Time.now().toNat();
    let receipt : Receipt = {
      id = newReceiptId;
      number;
      date = Time.now();
      customer;
      items;
      total;
      payments = [];
      status = #open;
      balance = total;
    };

    if (not receipts.containsKey(caller)) {
      receipts.add(caller, List.empty<Receipt>());
    };

    let currentReceipts = switch (receipts.get(caller)) {
      case (null) { List.empty<Receipt>() };
      case (?list) { list };
    };
    currentReceipts.add(receipt);
    newReceiptId;
  };

  public query ({ caller }) func getReceipts() : async [Receipt] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view receipts");
    };
    switch (receipts.get(caller)) {
      case (null) { [] };
      case (?list) { list.toArray() };
    };
  };

  public query ({ caller }) func getReceiptsSorted(sortBy : Text) : async [Receipt] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view receipts");
    };
    let receiptsArray = switch (receipts.get(caller)) {
      case (null) { [] };
      case (?list) { list.toArray() };
    };

    switch (sortBy) {
      case ("date") { receiptsArray.sort(Receipt.compareByDate) };
      case (_) { receiptsArray };
    };
  };

  // Payment Management
  public shared ({ caller }) func addPayment(receiptId : Nat, payment : Payment) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add payments");
    };

    switch (receipts.get(caller)) {
      case (null) { Runtime.trap("Receipt not found") };
      case (?receiptList) {
        let receiptArray = receiptList.toArray();
        let index = receiptArray.findIndex(func(r) { r.id == receiptId });
        switch (index) {
          case (null) { Runtime.trap("Receipt not found") };
          case (?i) {
            let receipt = receiptArray[i];
            let updatedPayments = receipt.payments.concat([payment]);
            let totalPayments = updatedPayments.foldLeft(0, func(acc, p) { acc + p.amount });
            let newBalance = if (totalPayments >= receipt.total) { 0 } else { receipt.total - totalPayments };
            let newStatus = if (totalPayments == 0) {
              #open;
            } else if (totalPayments >= receipt.total) {
              #paid;
            } else {
              #partial;
            };

            let updatedReceipt : Receipt = {
              receipt with
              payments = updatedPayments;
              balance = newBalance;
              status = newStatus;
            };

            let newReceiptList = List.empty<Receipt>();
            var idx = 0;
            while (idx < receiptArray.size()) {
              if (idx != i) {
                newReceiptList.add(receiptArray[idx]);
              } else {
                newReceiptList.add(updatedReceipt);
              };
              idx += 1;
            };
            receipts.add(caller, newReceiptList);
          };
        };
      };
    };
  };

  public query ({ caller }) func getReceiptPayments(receiptId : Nat) : async [Payment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view payments");
    };
    switch (receipts.get(caller)) {
      case (null) { [] };
      case (?receiptList) {
        switch (receiptList.find(func(r) { r.id == receiptId })) {
          case (null) { [] };
          case (?receipt) { receipt.payments };
        };
      };
    };
  };

  module Receipt {
    public func compareByDate(receipt1 : Receipt, receipt2 : Receipt) : Order.Order {
      Nat.compare(receipt1.date.toNat(), receipt2.date.toNat());
    };
  };
};
