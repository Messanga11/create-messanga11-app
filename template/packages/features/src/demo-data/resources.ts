import type { ResourceListPrimitiveProps } from "@starter/ui-engine";

export const RESOURCE_DEMOS = {
  categories: {
    columns: [
      { id: "name", label: "Category" },
      { id: "products", label: "Products" },
      { id: "status", label: "Status" },
    ],
    emptyLabel: "No categories",
    primaryAction: "Add new category",
    rows: [
      {
        cells: {
          name: { value: "Main courses" },
          products: { value: "18" },
          status: { tone: "success", value: "Active" },
        },
        id: "main-courses",
      },
      {
        cells: {
          name: { value: "Desserts" },
          products: { value: "12" },
          status: { tone: "success", value: "Active" },
        },
        id: "desserts",
      },
      {
        cells: {
          name: { value: "Beverages" },
          products: { value: "9" },
          status: { tone: "success", value: "Active" },
        },
        id: "beverages",
      },
      {
        cells: {
          name: { value: "Starters" },
          products: { value: "7" },
          status: { tone: "warning", value: "Draft" },
        },
        id: "starters",
      },
    ],
    title: "Categories",
  },
  couriers: {
    columns: [
      { id: "courier", label: "Courier" },
      { id: "phone", label: "Phone" },
      { id: "deliveries", label: "Deliveries" },
      { id: "status", label: "Status" },
    ],
    emptyLabel: "No couriers",
    primaryAction: "Add courier",
    rows: [
      {
        cells: {
          courier: { secondary: "courier1@finefoods.co", value: "Albert Flores" },
          deliveries: { value: "128" },
          phone: { value: "+1 202 555 0148" },
          status: { tone: "info", value: "On delivery" },
        },
        id: "albert",
      },
      {
        cells: {
          courier: { secondary: "courier2@finefoods.co", value: "Jane Cooper" },
          deliveries: { value: "116" },
          phone: { value: "+1 202 555 0184" },
          status: { tone: "success", value: "Available" },
        },
        id: "jane",
      },
      {
        cells: {
          courier: { secondary: "courier3@finefoods.co", value: "Jacob Jones" },
          deliveries: { value: "94" },
          phone: { value: "+1 202 555 0109" },
          status: { tone: "neutral", value: "Offline" },
        },
        id: "jacob",
      },
    ],
    title: "Couriers",
  },
  customers: {
    columns: [
      { id: "customer", label: "Customer" },
      { id: "phone", label: "Phone" },
      { id: "orders", label: "Orders" },
      { id: "spent", label: "Total spent" },
    ],
    emptyLabel: "No customers",
    primaryAction: "Add customer",
    rows: [
      {
        cells: {
          customer: { secondary: "jaren@example.com", value: "Jaren Heaney" },
          orders: { value: "18" },
          phone: { value: "+1 212 555 0188" },
          spent: { value: "$1,248.00" },
        },
        id: "jaren",
      },
      {
        cells: {
          customer: { secondary: "bethany@example.com", value: "Bethany Klein" },
          orders: { value: "12" },
          phone: { value: "+1 212 555 0113" },
          spent: { value: "$842.50" },
        },
        id: "bethany",
      },
      {
        cells: {
          customer: { secondary: "conor@example.com", value: "Conor Lang" },
          orders: { value: "9" },
          phone: { value: "+1 212 555 0199" },
          spent: { value: "$614.00" },
        },
        id: "conor",
      },
    ],
    title: "Customers",
  },
  orders: {
    columns: [
      { id: "order", label: "Order" },
      { id: "status", label: "Status" },
      { id: "products", label: "Products" },
      { id: "amount", label: "Amount" },
      { id: "store", label: "Store" },
      { id: "customer", label: "Customer" },
      { id: "created", label: "CreatedAt" },
    ],
    emptyLabel: "No orders",
    primaryAction: "Export",
    rows: [
      {
        cells: {
          amount: { value: "$24.50" },
          created: { value: "Aug 26, 09:42" },
          customer: { value: "Jaren Heaney" },
          order: { value: "#921270" },
          products: { secondary: "3 items", value: "Cupcake, Calamari" },
          status: { tone: "warning", value: "Pending" },
          store: { value: "Brooklyn" },
        },
        id: "921270",
      },
      {
        cells: {
          amount: { value: "$28.00" },
          created: { value: "Aug 26, 09:31" },
          customer: { value: "Brandyn Stehr" },
          order: { value: "#846599" },
          products: { secondary: "3 items", value: "Cheeseburger, Edamame" },
          status: { tone: "info", value: "On the way" },
          store: { value: "Massapequa" },
        },
        id: "846599",
      },
      {
        cells: {
          amount: { value: "$18.00" },
          created: { value: "Aug 26, 09:04" },
          customer: { value: "Bethany Klein" },
          order: { value: "#450029" },
          products: { secondary: "1 item", value: "Salmon" },
          status: { tone: "success", value: "Delivered" },
          store: { value: "Lindenhurst" },
        },
        id: "450029",
      },
      {
        cells: {
          amount: { value: "$54.50" },
          created: { value: "Aug 26, 08:48" },
          customer: { value: "Conor Lang" },
          order: { value: "#980786" },
          products: { secondary: "4 items", value: "Salmon, Lasagna" },
          status: { tone: "danger", value: "Cancelled" },
          store: { value: "Massapequa" },
        },
        id: "980786",
      },
    ],
    title: "Orders",
  },
  products: {
    columns: [
      { id: "id", label: "ID #" },
      { id: "name", label: "Name" },
      { id: "description", label: "Description" },
      { id: "price", label: "Price" },
      { id: "category", label: "Category" },
      { id: "status", label: "Status" },
    ],
    emptyLabel: "No products",
    primaryAction: "Add new product",
    rows: [
      {
        cells: {
          category: { value: "Burgers" },
          description: { value: "Turkey, avocado, tomato" },
          id: { value: "#1012" },
          name: { value: "Turkey Burger" },
          price: { value: "$9.50" },
          status: { tone: "success", value: "Published" },
        },
        id: "turkey-burger",
      },
      {
        cells: {
          category: { value: "Pasta" },
          description: { value: "Ricotta, herbs, tomato" },
          id: { value: "#1013" },
          name: { value: "Ravioli" },
          price: { value: "$14.50" },
          status: { tone: "success", value: "Published" },
        },
        id: "ravioli",
      },
      {
        cells: {
          category: { value: "Salads" },
          description: { value: "Tuna, egg, olives" },
          id: { value: "#1014" },
          name: { value: "Nicoise Salad" },
          price: { value: "$13.00" },
          status: { tone: "warning", value: "Draft" },
        },
        id: "nicoise",
      },
      {
        cells: {
          category: { value: "Desserts" },
          description: { value: "Dark chocolate ganache" },
          id: { value: "#1015" },
          name: { value: "Chocolate Cake" },
          price: { value: "$7.00" },
          status: { tone: "success", value: "Published" },
        },
        id: "cake",
      },
    ],
    title: "Products",
    viewModes: true,
  },
  stores: {
    columns: [
      { id: "name", label: "Store" },
      { id: "address", label: "Address" },
      { id: "orders", label: "Orders" },
      { id: "status", label: "Status" },
    ],
    emptyLabel: "No stores",
    primaryAction: "Add store",
    rows: [
      {
        cells: {
          address: { value: "Brooklyn, NY" },
          name: { secondary: "store-001", value: "Finefoods Brooklyn" },
          orders: { value: "1,204" },
          status: { tone: "success", value: "Open" },
        },
        id: "brooklyn",
      },
      {
        cells: {
          address: { value: "Massapequa, NY" },
          name: { secondary: "store-002", value: "Finefoods Massapequa" },
          orders: { value: "986" },
          status: { tone: "success", value: "Open" },
        },
        id: "massapequa",
      },
      {
        cells: {
          address: { value: "Lindenhurst, NY" },
          name: { secondary: "store-003", value: "Finefoods Lindenhurst" },
          orders: { value: "742" },
          status: { tone: "warning", value: "Closing soon" },
        },
        id: "lindenhurst",
      },
    ],
    title: "Stores",
  },
} as const satisfies Readonly<Record<string, ResourceListPrimitiveProps>>;
