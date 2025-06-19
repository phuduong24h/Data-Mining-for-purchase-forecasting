const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const FPGrowth = require("node-fpgrowth").FPGrowth;

// Đọc dữ liệu từ file CSV và chuyển thành mảng các object JSON
const readCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
};

//Làm sạch dữ liệu đầu vào
const cleanData = (data) => {
  return data.filter(
    (row) =>
      row.Quantity > 0 &&
      row.UnitPrice > 0 &&
      row.InvoiceNo &&
      !row.InvoiceNo.startsWith("C") &&
      row.Description &&
      row.CustomerID
  );
};

//Xử lý toàn bộ dữ liệu để khai thác luật kết hợp
const processData = async () => {
  try {
    const data = await readCSV(
      path.join(__dirname, "data", "cleaned_online_retail.csv")
    );
    const cleanedData = cleanData(data);

    const transactions = cleanedData
      .reduce((acc, row) => {
        const invoice = acc.find((item) => item.invoiceNo === row.InvoiceNo);
        if (invoice) {
          invoice.products.push(row.Description);
        } else {
          acc.push({ invoiceNo: row.InvoiceNo, products: [row.Description] });
        }
        return acc;
      }, [])
      .map((item) => item.products);

    const fpgrowth = new FPGrowth(0.02);
    const itemsets = await fpgrowth.exec(transactions);

    itemsetsCache = itemsets;

    console.log("FP-Growth done. Itemsets generated.");
  } catch (error) {
    console.error("Error processing data:", error);
  }
};

// Hàm: Gợi ý sản phẩm dựa trên danh sách sản phẩm đã chọn
const getSuggestions = (selectedItems) => {
  return itemsetsCache
    .filter(
      (set) =>
        selectedItems.some((item) => set.items.includes(item)) &&
        !set.items.every((item) => selectedItems.includes(item))
    )
    .map((set) => ({
      items: set.items.filter((item) => !selectedItems.includes(item)),
      support: set.support,
    }))
    .filter((set) => set.items.length > 0);
};

let itemsetsCache = [];

module.exports = { processData, getSuggestions };
