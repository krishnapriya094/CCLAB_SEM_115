
const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("public"));

let foods = [
  { id: 1, name: "Burger", price: 120, category: "Fast Food" },
  { id: 2, name: "Pizza", price: 250, category: "Italian" },
  { id: 3, name: "Dosa", price: 60, category: "South Indian" }
];

let orders = [];
let nextFoodId = 4;
let nextOrderId = 1;

// READ: Display all food items
app.get("/api/foods", (req, res) => {
  res.json(foods);
});

// CREATE: Add a new food item
app.post("/api/foods", (req, res) => {
  const { name, price, category } = req.body;

  if (!name || !Number.isFinite(price) || price <= 0 || !category) {
    return res.status(400).json({ error: "Enter valid food details" });
  }

  const food = {
    id: nextFoodId++,
    name,
    price,
    category
  };

  foods.push(food);
  res.status(201).json(food);
});

// UPDATE: Edit a food item
app.put("/api/foods/:id", (req, res) => {
  const food = foods.find(f => f.id === Number(req.params.id));

  if (!food) {
    return res.status(404).json({ error: "Food not found" });
  }

  const { name, price, category } = req.body;

  if (
    !name || !category ||
    !Number.isFinite(price) || price <= 0
  ) {
    return res.status(400).json({ error: "Invalid food details" });
  }

  food.name = name;
  food.price = price;
  food.category = category;

  res.json(food);
});

// DELETE: Remove a food item
app.delete("/api/foods/:id", (req, res) => {
  const oldLength = foods.length;
  foods = foods.filter(f => f.id !== Number(req.params.id));

  if (foods.length === oldLength) {
    return res.status(404).json({ error: "Food not found" });
  }

  res.json({ message: "Food deleted successfully" });
});

// CREATE: Place a customer order
app.post("/api/orders", (req, res) => {
  const { foodId, customer, quantity } = req.body;
  const food = foods.find(f => f.id === Number(foodId));

  if (
    !food || !customer?.trim() ||
    !Number.isInteger(quantity) || quantity < 1
  ) {
    return res.status(400).json({ error: "Invalid order details" });
  }

  const order = {
    id: nextOrderId++,
    customer: customer.trim(),
    foodName: food.name,
    quantity,
    total: food.price * quantity,
    status: "Pending"
  };

  orders.push(order);
  res.status(201).json(order);
});

// READ: View all orders
app.get("/api/orders", (req, res) => {
  res.json(orders);
});

// UPDATE: Change order status
app.put("/api/orders/:id", (req, res) => {
  const order = orders.find(o => o.id === Number(req.params.id));

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  const allowed = ["Pending", "Preparing", "Delivered", "Cancelled"];

  if (!allowed.includes(req.body.status)) {
    return res.status(400).json({ error: "Invalid order status" });
  }

  order.status = req.body.status;
  res.json(order);
});

// DELETE: Cancel/remove an order
app.delete("/api/orders/:id", (req, res) => {
  const oldLength = orders.length;
  orders = orders.filter(o => o.id !== Number(req.params.id));

  if (orders.length === oldLength) {
    return res.status(404).json({ error: "Order not found" });
  }

  res.json({ message: "Order deleted successfully" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
