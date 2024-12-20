import express from 'express';
import { NlpManager } from "node-nlp"; 
import cors from 'cors';

import mysql from "mysql2/promise";

const app = express();


import dotenv from 'dotenv';
dotenv.config();

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT

const db = await mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});
//add test part here

const initializeTables = async () => {
  const createTables = [
    `
    CREATE TABLE IF NOT EXISTS Customers (
        CustomerID INT AUTO_INCREMENT PRIMARY KEY,
        Name VARCHAR(250),
        Phone VARCHAR(20)
    )
    `  ,
   `
    CREATE TABLE IF NOT EXISTS Bills (
        BillID INT AUTO_INCREMENT PRIMARY KEY,
        BillDate DATETIME,
        CustomerID INT,
        TotalAmount DECIMAL(10, 2),
        PaymentStatus VARCHAR(250),
        FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID)
    )
    `,
    `
    CREATE TABLE IF NOT EXISTS Stocks (
        StockID INT AUTO_INCREMENT PRIMARY KEY,
        ProductName VARCHAR(250),
        Quantity INT,
        Price DECIMAL(10, 2)
    )
    `
  ];

  try {
    for (const query of createTables) {
      await db.query(query);
    }
    console.log("Tables initialized successfully.");
  } catch (error) {
    console.error("Error initializing tables:", error);
  }
};

await initializeTables();



const manager = new NlpManager({ languages: ["en"] });

const trainNLPModel = async () => {

  //greetings
  manager.addDocument('en', 'Hello', 'greeting');
  manager.addDocument('en', 'Hey', 'greeting');
  manager.addDocument('en', 'Hi', 'greeting');
  manager.addDocument('en', 'sup', 'greeting');
  manager.addDocument('en', 'yo', 'greeting');
  manager.addAnswer('en', 'greeting', 'I\'m here to assist you. How can I help?');
  manager.addAnswer('en', 'greeting', 'Hello! Ready to assist your business needs.');
  manager.addAnswer('en', 'greeting', 'Hello! How can I help you today?');
  manager.addAnswer('en', 'greeting', 'Hi there! What can I do for you?');

  // adding new bills 
  manager.addDocument("en", "add a new bill for [Customer Name], [TotalAmount], [PaymentStatus]");
  manager.addDocument("en", "save a new bill for", "add.bill");
  manager.addDocument("en", "create a new bill for", "add.bill");
manager.addAnswer("en", "add.bill", "Please provide the bill details in the format: [CustomerName], [TotalAmount], [PaymentStatus]");

  // display bills 
  manager.addDocument("en", "display bills", "get.bills");
  manager.addDocument("en", "show me bills", "get.bills");
  manager.addDocument("en", "display latest bills", "get.bills");
  manager.addAnswer("en", "get.bills", "Fetching your latest bills...");

  //to get customer details
  manager.addDocument("en", "get customer details of [name]", "get.customer");
  manager.addDocument("en", "show me customer details of [name]", "get.customer");
  manager.addAnswer("en", "get.customer", "Fetching customer details...");

  // to add  new customer
  manager.addDocument("en", "add a new customer", "add.customer");
  manager.addDocument("en", "create a new customer", "add.customer");
  manager.addDocument("en", "save customer details", "add.customer");
  manager.addAnswer("en", "add.customer", "Please provide the customer details in the format: [CustomerName], [Phone]");

  // to update phone
  manager.addDocument("en", "update phone for [CustomerName], [NewPhone]", "update.customer.phone");
  manager.addDocument("en", "change phone for [CustomerName], [NewPhone]", "update.customer.phone");
  manager.addDocument("en", "modify contact info for [CustomerName], [NewPhone]", "update.customer.phone");
  manager.addAnswer("en", "update.customer.phone", "Updating the phone number...");

  //to view bills of a particular date
  manager.addDocument("en", "show me the bills for [Date]", "get.bills.by.date");
  manager.addDocument("en", "display the bills of [Date]", "get.bills.by.date");
  manager.addDocument("en", "fetch the bills for [Date]", "get.bills.by.date");
  manager.addDocument("en", "get bills dated [Date]", "get.bills.by.date");
  manager.addDocument("en", "bills from [Date]", "get.bills.by.date");
  manager.addAnswer("en", "get.bills.by.date", "Fetching bills for the specified date...");

  // to delete a bill
  manager.addDocument("en", "delete bill with id [BillID]", "delete.bill");
  manager.addDocument("en", "remove bill with id [BillID]", "delete.bill");
  manager.addDocument("en", "delete the bill ID [BillID]", "delete.bill");
  manager.addAnswer("en", "delete.bill", "Deleting the bill...");

  // Add new stock
  manager.addDocument("en", "add stock for ", "add.stock");
  manager.addDocument("en", "add stock for pens", "add.stock");
manager.addDocument("en", "add stock for items", "add.stock");
manager.addDocument("en", "add stock for {item}", "add.stock");
manager.addDocument("en", "add a new batch of {item}","add.stock");
  manager.addDocument("en", "create new stock for ", "add.stock");
  manager.addAnswer("en", "add.stock", "Please provide stock details in the format: [ProductName], [Quantity], [Price]");

  // Display stock
  manager.addDocument("en", "get all stocks", "get.stocks");
  manager.addDocument("en", "show me all the stocks", "get.stocks");
  manager.addDocument("en", "show me the stocks", "get.stocks");
  manager.addDocument("en", "display all the stocks of shop", "get.stocks");
  manager.addDocument("en", "display stocks", "get.stocks");
  manager.addAnswer("en", "get.stocks", "Fetching stock details...");

  // Update stock
  manager.addDocument("en", "update stock  for ", "update.stock");
  manager.addDocument("en", "change stock for ", "update.stock");
  manager.addDocument("en", "change stock of ", "update.stock");
  manager.addDocument("en", "update stock of ", "update.stock");
  manager.addDocument("en", "update stock price of ", "update.stock");
  manager.addDocument("en", "update stock quantity of ", "update.stock");
  manager.addAnswer("en", "update.stock", "Updating stock details...");

  // Delete stock
  manager.addDocument("en", "delete stock for ", "delete.stock");
  manager.addDocument("en", "delete stock of ", "delete.stock");
  manager.addDocument("en", "remove stock for ", "delete.stock");
  manager.addDocument("en", "remove stock of ", "delete.stock");
  manager.addAnswer("en", "delete.stock", "Deleting stock...");

  // chnage price
  manager.addDocument('en', 'change price for * to *', 'change.price');
manager.addDocument('en', 'update price for * to *', 'change.price');
manager.addDocument('en', 'set price for * to *', 'change.price');
manager.addDocument('en', 'change price of * to *', 'change.price');
manager.addDocument('en', 'update price of * to *', 'change.price');
manager.addDocument('en', 'set price of * to *', 'change.price');
manager.addDocument('en', 'change the price of * to *', 'change.price');

//add more quantity or increase stock
manager.addDocument('en', 'add quantity for * by *', 'add.quantity');
manager.addDocument('en', 'increase quantity for * by *', 'add.quantity');
manager.addDocument('en', 'add stock for * by *', 'add.quantity');
manager.addDocument('en', 'add stock of * by *', 'add.quantity');
manager.addDocument('en', 'increase stock for * by *', 'add.quantity');
manager.addDocument('en', 'increase stock of * by *', 'add.quantity');
manager.addDocument('en', 'add more quantity for * by *', 'add.quantity');
manager.addDocument('en', 'add more quantity of * by *', 'add.quantity');




  

  await manager.train();
  manager.save();
};

await trainNLPModel();

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  const response = await manager.process("en", userMessage);

  let botMessage = response.answer;

  try {
    if (response.intent === "get.bills") {
      const dateMatch = userMessage.match(/\b(\d{1,2}\/\d{1,2}\/\d{4})\b/);
      if (dateMatch) {
        response.intent = "get.bills.by.date"; 
      }
    }

    if (response.intent === "get.bills") {
      const [rows] = await db.query(`
        SELECT 
          Bills.BillID,
          Customers.Name AS CustomerName,
          Bills.TotalAmount,
          Bills.BillDate
        FROM 
          Bills
        JOIN 
          Customers
        ON 
          Bills.CustomerID = Customers.CustomerID
        LIMIT 10
      `);
      botMessage = formatBillsTable(rows);
    } else if (response.intent === "get.customer") {
      botMessage = await getCustomerDetails(userMessage);
    } else if (response.intent === "update.customer.phone") { 
      botMessage = await updateCustomerPhone(userMessage);
    } else if (response.intent === "greeting") {
      botMessage = response.answer || "Hello! How can I assist you today?";
    } else if (response.intent === "add.bill") {
      botMessage = await addBill(userMessage);
    } else if (response.intent === "get.bills.by.date") {
      botMessage = await getBillsByDate(userMessage);
    } else if (response.intent === "add.customer") {
      botMessage = await addCustomer(userMessage);
    } else if (response.intent === "delete.bill") {
      botMessage = await deleteBill(userMessage);
    } else if (response.intent === "add.stock") {
      botMessage = await addStock(userMessage);
    } else if (response.intent === "get.stocks") {
      botMessage = await getStocks();
    } else if (response.intent === "update.stock") {
      botMessage = await updateStock(userMessage);
    } else if (response.intent === "delete.stock") {
      botMessage = await deleteStock(userMessage);
    } else if (response.intent === "change.price") {
      botMessage = await changePrice(userMessage);
    } else if (response.intent === "add.quantity") {
      botMessage = await addQuantity(userMessage);
    } else {
      botMessage = "Sorry, I didn't understand that. Can you please clarify your request?";
    }
  } catch (error) {
    console.error("Error interacting with database:", error);
    botMessage = "Sorry, I encountered an error while interacting with the database.";
  }

  res.json({ message: botMessage });
});


// this fucntion is to add new bills
const addBill = async (userMessage) => {
  try {
    let sanitizedMessage = userMessage.replace(/\s*comma\s*/gi, ',');

    sanitizedMessage = sanitizedMessage.replace(/[.!?]/g, '');

    const match = sanitizedMessage.match(/for\s+([\w\s]+?)[,\s]+([\d,]+)[,\s]+(.+)/i);

    if (!match) {
      return "Please provide the details in the format: Add a bill for [CustomerName], [TotalAmount], [PaymentStatus]";
    }

    const [_, customerName, totalAmountRaw, paymentStatus] = match;
    const totalAmount = parseFloat(totalAmountRaw.replace(/,/g, ''));

    if (isNaN(totalAmount)) {
      return "TotalAmount must be numeric.";
    }

    const billDate = new Date();

    const [existingCustomer] = await db.query(
      "SELECT * FROM Customers WHERE Name = ? LIMIT 1", 
      [customerName.trim()]
    );

    let customerID;
    if (existingCustomer.length > 0) {
      customerID = existingCustomer[0].CustomerID;
    } else {
      const [result] = await db.query(
        `INSERT INTO Customers (Name) VALUES (?)`,
        [customerName.trim()]
      );
      customerID = result.insertId;
    }

    const [billResult] = await db.query(
      `INSERT INTO Bills (BillDate, CustomerID, TotalAmount, PaymentStatus) VALUES (?, ?, ?, ?)`,
      [billDate, customerID, totalAmount, paymentStatus.trim()]
    );

    if (billResult.affectedRows > 0) {
      return `New bill added successfully! Bill ID: ${billResult.insertId}`;
    } else {
      return "Failed to add the bill. Please try again.";
    }
  } catch (error) {
    console.error("Error adding bill:", error);
    return "An error occurred while adding the bill. Please try again.";
  }
};

  const formatBillsTable = (bills) => {
    if (bills.length === 0) {
      return "No bills found.";
    }

    let table = `
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th>Bill ID</th>
            <th>Customer Name</th>
            <th>Amount</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    bills.forEach((bill) => {
      table += `
        <tr>
          <td>${bill.BillID}</td>
          <td>${bill.CustomerName}</td>
          <td>${bill.TotalAmount}</td>
          <td>${new Date(bill.BillDate).toLocaleString()}</td>
        </tr>
      `;
    });

    table += `</tbody></table>`;
    return `Here are your latest bills:<br>${table}`;
  };

  // this function is to add new customers
  const addCustomer = async (userMessage) => {
    try {
      let sanitizedMessage = userMessage.replace(/\s*comma\s*/gi, ',');  
      sanitizedMessage = sanitizedMessage.replace(/[.!?-]/g, '');  

      const match = sanitizedMessage.match(/customer\s+([A-Za-z\s]+)(?:,\s*|\s+)(\d{10,15})/i);

      if (!match) {
        return "Please provide the customer details in the format: Add a customer [CustomerName], [Phone].";
      }

      const [_, customerName, phone] = match;

      const [existingCustomer] = await db.query(
        "SELECT CustomerID FROM Customers WHERE Name = ? LIMIT 1",
        [customerName.trim()]
      );

      if (existingCustomer.length > 0) {
        return `Customer already exists with Customer ID: ${existingCustomer[0].CustomerID}`;
      }

      const [result] = await db.query(
        `INSERT INTO Customers (Name, Phone) VALUES (?, ?)`,
        [customerName.trim(), phone.trim()]
      );

      if (result.affectedRows > 0) {
        return `New customer added successfully! Customer Name: ${customerName}`;
      } else {
        return "Failed to add the customer. Please try again.";
      }
    } catch (error) {
      console.error("Error adding customer:", error);
      return "An error occurred while adding the customer. Please try again.";
    }
  };

  // this function is to display customer's details
  const getCustomerDetails = async (userMessage) => {
    try {
      const match = userMessage.match(/of\s+([A-Za-z\s]+)/i);
      if (!match) {
        return "Please specify a valid customer name.";
      }

      const customerName = match[1].trim();

      const [customerDetails] = await db.query(
        "SELECT * FROM Customers WHERE LOWER(Name) = LOWER(?) LIMIT 1",
        [customerName]
      );

      if (customerDetails.length > 0) {
        const phone = customerDetails[0].Phone || "not provided"; 
        
        let table = `
          <table>
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Name</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${customerDetails[0].CustomerID}</td>
                <td>${customerDetails[0].Name}</td>
                <td>${phone}</td>
              </tr>
            </tbody>
          </table>
        `;
        return `Here are the customer details:<br>${table}`;
      } else {
        return "Customer not found.";
      }
    } catch (error) {
      console.error("Error fetching customer details:", error);
      return "An error occurred while fetching customer details. Please try again.";
    }
  };


  // this function is for updating phone number  of a customer
  const updateCustomerPhone = async (userMessage) => {
    try {
      let sanitizedMessage = userMessage.replace(/\s*comma\s*/gi, ',');  
      sanitizedMessage = sanitizedMessage.replace(/[.!?-]/g, '');  

      const match = sanitizedMessage.match(/(?:for|of)\s+([A-Za-z\s]+)(?:,\s*|\s+)(\d{10,15})/i);

      if (!match) {
        return "Please provide the details in the format: Update phone for [CustomerName], [NewPhone].";
      }

      const [_, customerName, newPhone] = match;

      const [customerDetails] = await db.query(
        "SELECT CustomerID FROM Customers WHERE LOWER(Name) = LOWER(?) LIMIT 1",
        [customerName.trim()]
      );

      if (customerDetails.length === 0) {
        return `Customer with name "${customerName}" not found.`;
      }

      const [result] = await db.query(
        "UPDATE Customers SET Phone = ? WHERE CustomerID = ?",
        [newPhone.trim(), customerDetails[0].CustomerID]
      );

      if (result.affectedRows > 0) {
        return `Phone number updated successfully for ${customerName}!`;
      } else {
        return "Failed to update the phone number. Please try again.";
      }
    } catch (error) {
      console.error("Error updating customer phone number:", error);
      return "An error occurred while updating the phone number. Please try again.";
    }
  };

  const getBillsByDate = async (userMessage) => {
    try {
      const match = userMessage.match(/of\s+(\d{1,2}\/\d{1,2}\/\d{4})/i);

      if (!match) {
        return "Please provide a valid date in the format: DD/MM/YYYY.";
      }

      const [_, dateString] = match;
      const [day, month, year] = dateString.split("/").map((part) => parseInt(part, 10));
      const queryDate = new Date(year, month - 1, day);

      if (isNaN(queryDate)) {
        return "The provided date is invalid. Please use the format DD/MM/YYYY.";
      }

      const [rows] = await db.query(
        `
        SELECT 
          Bills.BillID,
          Customers.Name AS CustomerName,
          Bills.TotalAmount,
          Bills.BillDate
        FROM 
          Bills
        JOIN 
          Customers
        ON 
          Bills.CustomerID = Customers.CustomerID
        WHERE 
          DATE(Bills.BillDate) = DATE(?)
        `,
        [queryDate]
      );

      if (rows.length === 0) {
        return `No bills were found for the date ${dateString}.`;
      }

      let table = `
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th>Bill ID</th>
              <th>Customer Name</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
      `;

      rows.forEach((bill) => {
        table += `
          <tr>
            <td>${bill.BillID}</td>
            <td>${bill.CustomerName}</td>
            <td>${bill.TotalAmount}</td>
            <td>${new Date(bill.BillDate).toLocaleString()}</td>
          </tr>
        `;
      });

      table += `</tbody></table>`;
      return `Here are the bills of ${dateString}:<br>${table}`;
    } catch (error) {
      console.error("Error fetching bills by date:", error);
      return "An error occurred while fetching bills. Please try again.";
    }
  };

  const deleteBill = async (userMessage) => {
    try {
      const sanitizedMessage = userMessage.replace(/\./g, '');

      const match = sanitizedMessage.match(/ID\s+(\d+)/i);
      if (!match) {
        return "Please specify the Bill ID in the format: Delete bill with ID [BillID].";
      }

      const billID = parseInt(match[1], 10);

      const [result] = await db.query(
        "DELETE FROM Bills WHERE BillID = ?",
        [billID]
      );

      if (result.affectedRows > 0) {
        return `Bill with ID ${billID} has been successfully deleted.`;
      } else {
        return `No bill found with ID ${billID}. Please check the ID and try again.`;
      }
    } catch (error) {
      console.error("Error deleting bill:", error);
      return "An error occurred while deleting the bill. Please try again.";
    }
  };


  //stock related functions
const addStock = async (userMessage) => {
    try {
      let sanitizedMessage = userMessage.replace(/\s*comma\s*/gi, ',').replace(/[.!?]/g, '');
  
      const match = sanitizedMessage.match(/\b(?:for|of)\s+([\w\s]+?)[,\s]+(\d+)[,\s]+(\d+(\.\d+)?)/i);
  
      if (!match) {
        return "Please provide stock details in the format: Add stock for [ProductName], [Quantity], [Price]";
      }
  
      const [_, productName, quantityRaw, priceRaw] = match;
      const quantity = parseInt(quantityRaw);
      const price = parseFloat(priceRaw);
  
      if (isNaN(quantity) || isNaN(price)) {
        return "Quantity and Price must be numeric.";
      }

      const [existingProduct] = await db.query(
        `SELECT * FROM Stocks WHERE ProductName = ?`,
        [productName.trim()]
    );

    if (existingProduct.length > 0) {
        return `The product "${productName}" is already present in the stock. Use update stock if you want to update quantity or price`;
    }
  
      const [result] = await db.query(
        `INSERT INTO Stocks (ProductName, Quantity, Price) VALUES (?, ?, ?)`,
        [productName.trim(), quantity, price]
      );
  
      if (result.affectedRows > 0) {
        return `New stock added successfully! Product: ${productName}`;
      } else {
        return "Failed to add the stock. Please try again.";
      }
    } catch (error) {
      console.error("Error adding stock:", error);
      return "An error occurred while adding the stock. Please try again.";
  }
};

const getStocks = async () => {
  try {
    const [rows] = await db.query(
      `SELECT StockID, ProductName, Quantity, Price FROM Stocks`
    );

    if (rows.length === 0) {
      return "There is no stock of any product present in your shop.";
    }

    let table = `
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th>Stock ID</th>
            <th>Product Name</th>
            <th>Quantity</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
    `;

    rows.forEach((stock) => {
      table += `
        <tr>
          <td>${stock.StockID}</td>
          <td>${stock.ProductName}</td>
          <td>${stock.Quantity}</td>
          <td>${stock.Price}</td>
        </tr>
      `;
    });

    table += `</tbody></table>`;
    return `Here are the stock details:<br>${table}`;
  } catch (error) {
    console.error("Error fetching stock details:", error);
    return "An error occurred while fetching stock details. Please try again.";
  }
};

const updateStock = async (userMessage) => {
  try {
    let sanitizedMessage = userMessage.replace(/\s*comma\s*/gi, ',').replace(/[.!?-]/g, '');

    const match = sanitizedMessage.match(/\b(?:for|of)\s+([\w\s]+?)[,\s]+(\d+)[,\s]+(\d+(\.\d+)?)/i);

    if (!match) {
      return "Please provide the details in the format: Update stock for [ProductName], [NewQuantity], [NewPrice].";
    }

    const [_, productName, quantityRaw, priceRaw] = match;
    const quantity = parseInt(quantityRaw);
    const price = parseFloat(priceRaw);

    if (isNaN(quantity) || isNaN(price)) {
      return "Quantity and Price must be numeric.";
    }

    const [result] = await db.query(
      `UPDATE Stocks SET Quantity = ?, Price = ? WHERE ProductName = ?`,
      [quantity, price, productName.trim()]
    );

    if (result.affectedRows > 0) {
      return `Stock updated successfully for ${productName}.`;
    } else {
      return `No stock found for ${productName}. Please check the product name and try again.`;
    }
  } catch (error) {
    console.error("Error updating stock:", error);
    return "An error occurred while updating the stock. Please try again.";
  }
};

const deleteStock = async (userMessage) => {
  try {
    const sanitizedMessage = userMessage.replace(/\./g, '');

    const match = sanitizedMessage.match(/\b(?:for|of)\s+([\w\s]+)/i);
    if (!match) {
      return "Please specify the product name in the format: Delete stock of [ProductName].";
    }

    const productName = match[1].trim();

    const [result] = await db.query(
      "DELETE FROM Stocks WHERE ProductName = ?",
      [productName]
    );

    if (result.affectedRows > 0) {
      return `Stock for ${productName} has been successfully deleted.`;
    } else {
      return `No stock found for ${productName}. Please check the product name and try again.`;
    }
  } catch (error) {
    console.error("Error deleting stock:", error);
    return "An error occurred while deleting the stock. Please try again.";
  }
};

const changePrice = async (userMessage) => {
  try {
    let sanitizedMessage = userMessage.replace(/\s*comma\s*/gi, ',').replace(/[.!?]/g, '');

    const match = sanitizedMessage.match(/\b(?:for|of)\s+([\w\s]+?)\s*(?:to)?\s*(\d+(\.\d+)?)/i);
  
    if (!match) {
      return "Please provide product details in the format: Change price of [ProductName] to [NewPrice]";
    }
  
    const [_, productName, priceRaw] = match;
    const price = parseFloat(priceRaw);
  
    if (isNaN(price)) {
      return "Price must be a numeric value.";
    }

    const [existingProduct] = await db.query(
      `SELECT * FROM Stocks WHERE ProductName = ?`,
      [productName.trim()]
    );

    if (existingProduct.length === 0) {
      return "Product not found. Please check the product name.";
    }

    const [result] = await db.query(
      `UPDATE Stocks SET Price = ? WHERE ProductName = ?`,
      [price, productName.trim()]
    );

    if (result.affectedRows > 0) {
      return `Price for ${productName} updated successfully to ${price}`;
    } else {
      return "Failed to update the price. Please try again.";
    }
  } catch (error) {
    console.error("Error changing price:", error);
    return "An error occurred while changing the price. Please try again.";
  }
};

const addQuantity = async (userMessage) => {
  try {
    let sanitizedMessage = userMessage.replace(/\s*comma\s*/gi, ',').replace(/[.!?]/g, '');

    const match = sanitizedMessage.match(/\b(?:for|of)\s+([\w\s]+?)\s*(?:by)?\s*(\d+(\.\d+)?)/i);
  
    if (!match) {
      return "Please provide product details in the format: Add quantity for [ProductName] by [Quantity]";
    }
  
    const [_, productName, quantityRaw] = match;
    const quantity = parseInt(quantityRaw);
  
    if (isNaN(quantity)) {
      return "Quantity must be a numeric value.";
    }

    const [existingProduct] = await db.query(
      `SELECT * FROM Stocks WHERE ProductName = ?`,
      [productName.trim()]
    );

    if (existingProduct.length === 0) {
      return "Product not found. Please check the product name.";
    }

    const newQuantity = existingProduct[0].Quantity + quantity;

    const [result] = await db.query(
      `UPDATE Stocks SET Quantity = ? WHERE ProductName = ?`,
      [newQuantity, productName.trim()]
    );

    if (result.affectedRows > 0) {
      return `Quantity of ${productName} updated successfully. New quantity: ${newQuantity}`;
    } else {
      return "Failed to update the quantity. Please try again.";
    }
  } catch (error) {
    console.error("Error adding quantity:", error);
    return "An error occurred while adding the quantity. Please try again.";
  }
};


// test ends here
app.listen(PORT, ()=>{
    console.log("app is listening");
});